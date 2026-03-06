import { createFileRoute } from '@tanstack/react-router'
import { getFacebookClient } from "@/lib/auth/facebook"
import { getCookie } from '@tanstack/react-start/server'
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { createSession } from "@/lib/auth"
import { randomUUID } from "crypto"

export const Route = createFileRoute('/login/facebook/callback')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const facebook = getFacebookClient(request)
        if (!facebook) {
            return new Response("Facebook OAuth not configured", { status: 500 })
        }

        const url = new URL(request.url)
        const code = url.searchParams.get("code")
        const state = url.searchParams.get("state")
        
        const storedState = getCookie('facebook_oauth_state') ?? null

        if (!code || !state || !storedState || state !== storedState) {
            return new Response("Invalid OAuth state", {
                status: 400,
            })
        }

        try {
            const tokens = await facebook.validateAuthorizationCode(code)
            const accessToken = typeof (tokens as any).accessToken === 'function' ? (tokens as any).accessToken() : (tokens as any).accessToken

            const response = await fetch("https://graph.facebook.com/me?fields=id,name,email,picture&access_token=" + accessToken, {
                method: "GET",
            })
            const facebookUser: any = await response.json()

            if (facebookUser.error || !facebookUser.id) {
                throw new Error(`Facebook UserInfo error: ${facebookUser.error?.message || 'Missing ID'}`)
            }

            // Check for active session to link account
            const { getUser } = await import("@/lib/auth")
            const session = await getUser()

            if (session) {
                const existingUserWithFacebook = await db.select().from(users).where(eq(users.facebookId, facebookUser.id)).limit(1)

                if (existingUserWithFacebook.length > 0 && existingUserWithFacebook[0].id !== session.userId) {
                    return new Response(null, {
                        status: 302,
                        headers: {
                            Location: "/profile?error=account_already_linked",
                        },
                    })
                }

                await db.update(users).set({
                    facebookId: facebookUser.id,
                    facebookProfilePictureUrl: facebookUser.picture?.data?.url
                }).where(eq(users.id, session.userId))

                return new Response(null, {
                    status: 302,
                    headers: {
                        Location: "/profile?success=account_linked",
                    },
                })
            }

            const existingUser = await db.select().from(users).where(eq(users.facebookId, facebookUser.id)).limit(1)

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

            const existingEmailUser = await db.select().from(users).where(eq(users.email, facebookUser.email)).limit(1)

            if (existingEmailUser.length > 0) {
                const user = existingEmailUser[0]
                await db.update(users).set({
                    facebookId: facebookUser.id,
                    facebookProfilePictureUrl: facebookUser.picture?.data?.url
                }).where(eq(users.id, user.id))

                await createSession(user.id, (user.role as any) || 'user')

                return new Response(null, {
                    status: 302,
                    headers: {
                        Location: "/dashboard?action=confirm_social_avatar&provider=facebook",
                    },
                })
            }

            const userId = randomUUID()
            await db.insert(users).values({
                id: userId,
                facebookId: facebookUser.id,
                email: facebookUser.email,
                name: facebookUser.name,
                firstName: facebookUser.name.split(' ')[0],
                lastName: facebookUser.name.split(' ').slice(1).join(' '),
                profilePictureUrl: facebookUser.picture?.data?.url,
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
