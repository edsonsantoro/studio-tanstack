import { createFileRoute } from '@tanstack/react-router'
import { getGoogleClient } from "@/lib/auth/google"
import { getCookie } from '@tanstack/react-start/server'
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { createSession } from "@/lib/auth"
import { randomUUID } from "crypto"

export const Route = createFileRoute('/login/google/callback')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const google = getGoogleClient(request)
        if (!google) {
            return new Response("Google OAuth not configured", { status: 500 })
        }

        const url = new URL(request.url)
        const code = url.searchParams.get("code")
        const state = url.searchParams.get("state")
        
        const storedState = getCookie('google_oauth_state') ?? null
        const codeVerifier = getCookie('google_code_verifier') ?? null

        if (!code || !state || !storedState || state !== storedState || !codeVerifier) {
            return new Response("Invalid OAuth state or verifier", {
                status: 400,
            })
        }

        try {
            const tokens = await google.validateAuthorizationCode(code, codeVerifier)
            const accessToken = typeof (tokens as any).accessToken === 'function' ? (tokens as any).accessToken() : (tokens as any).accessToken

            const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            })
            const googleUser: any = await response.json()

            if (googleUser.error || !googleUser.sub) {
                throw new Error(`Google UserInfo error: ${googleUser.error_description || googleUser.error || 'Missing sub'}`)
            }

            // Check for active session to link account
            const { getUser } = await import("@/lib/auth")
            const session = await getUser()

            if (session) {
                const existingUserWithGoogle = await db.select().from(users).where(eq(users.googleId, googleUser.sub)).limit(1)

                if (existingUserWithGoogle.length > 0 && existingUserWithGoogle[0].id !== session.userId) {
                    return new Response(null, {
                        status: 302,
                        headers: {
                            Location: "/profile?error=account_already_linked",
                        },
                    })
                }

                await db.update(users).set({
                    googleId: googleUser.sub,
                    googleProfilePictureUrl: googleUser.picture
                }).where(eq(users.id, session.userId))

                return new Response(null, {
                    status: 302,
                    headers: {
                        Location: "/profile?success=account_linked",
                    },
                })
            }

            const existingUser = await db.select().from(users).where(eq(users.googleId, googleUser.sub)).limit(1)

            if (existingUser.length > 0) {
                const user = existingUser[0]
                await createSession(user.id, (user.role as any) || 'user')
                return new Response(null, {
                    status: 302,
                    headers: {
                        Location: "/dashboard",
                    },
                })
            }

            const existingEmailUser = await db.select().from(users).where(eq(users.email, googleUser.email)).limit(1)

            if (existingEmailUser.length > 0) {
                const user = existingEmailUser[0]
                await db.update(users).set({
                    googleId: googleUser.sub,
                    googleProfilePictureUrl: googleUser.picture
                }).where(eq(users.id, user.id))

                await createSession(user.id, (user.role as any) || 'user')

                return new Response(null, {
                    status: 302,
                    headers: {
                        Location: "/dashboard?action=confirm_social_avatar&provider=google",
                    },
                })
            }

            const userId = randomUUID()
            await db.insert(users).values({
                id: userId,
                googleId: googleUser.sub,
                email: googleUser.email,
                name: googleUser.name,
                firstName: googleUser.given_name,
                lastName: googleUser.family_name,
                profilePictureUrl: googleUser.picture,
                role: 'user',
                createdAt: new Date(),
                isApproved: false,
                status: 'pending',
                inviteCode: randomUUID().substring(0, 8),
            })

            await createSession(userId, 'user')
            return new Response(null, {
                status: 302,
                headers: {
                    Location: "/dashboard",
                },
            })
        } catch (e) {
            console.error("OAuth error:", e)
            return new Response("OAuth error: " + (e as Error).message, {
                status: 500,
            })
        }
      },
    },
  },
})
