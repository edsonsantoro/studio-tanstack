import { createFileRoute } from '@tanstack/react-router'
import { getTwitterClient } from "@/lib/auth/twitter"
import { getCookie } from '@tanstack/react-start/server'
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { createSession } from "@/lib/auth"
import { randomUUID } from "crypto"

export const Route = createFileRoute('/login/twitter/callback')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const twitter = getTwitterClient(request)
        if (!twitter) {
            return new Response("Twitter OAuth not configured", { status: 500 })
        }

        const url = new URL(request.url)
        const code = url.searchParams.get("code")
        const state = url.searchParams.get("state")
        
        const storedState = getCookie('twitter_oauth_state') ?? null
        const codeVerifier = getCookie('twitter_code_verifier') ?? null

        if (!code || !state || !storedState || state !== storedState || !codeVerifier) {
            return new Response("Invalid OAuth state or verifier", {
                status: 400,
            })
        }

        try {
            const tokens = await twitter.validateAuthorizationCode(code, codeVerifier)
            const accessToken = typeof (tokens as any).accessToken === 'function' ? (tokens as any).accessToken() : (tokens as any).accessToken

            const response = await fetch("https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,id,username", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            })

            const twitterData = await response.json()
            const twitterUser = twitterData.data

            if (twitterData.errors || !twitterUser?.id) {
                throw new Error(`Twitter UserInfo error: ${JSON.stringify(twitterData.errors) || 'Missing ID'}`)
            }

            // Check for active session to link account
            const { getUser } = await import("@/lib/auth")
            const session = await getUser()

            if (session) {
                const existingUserWithTwitter = await db.select().from(users).where(eq(users.twitterId, twitterUser.id)).limit(1)

                if (existingUserWithTwitter.length > 0 && existingUserWithTwitter[0].id !== session.userId) {
                    return new Response(null, {
                        status: 302,
                        headers: {
                            Location: "/profile?error=account_already_linked",
                        },
                    })
                }

                const originalProfilePic = twitterUser.profile_image_url?.replace('_normal', '')
                await db.update(users).set({
                    twitterId: twitterUser.id,
                    twitterProfilePictureUrl: originalProfilePic
                }).where(eq(users.id, session.userId))

                return new Response(null, {
                    status: 302,
                    headers: {
                        Location: "/profile?success=account_linked",
                    },
                })
            }

            const existingUser = await db.select().from(users).where(eq(users.twitterId, twitterUser.id)).limit(1)

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

            const placeholderEmail = `${twitterUser.username}@twitter.example.com`
            const existingEmailUser = await db.select().from(users).where(eq(users.email, placeholderEmail)).limit(1)
            
            if (existingEmailUser.length > 0) {
                const user = existingEmailUser[0]
                await db.update(users).set({
                    twitterId: twitterUser.id,
                    twitterProfilePictureUrl: twitterUser.profile_image_url?.replace('_normal', '')
                }).where(eq(users.id, user.id))
                await createSession(user.id, (user.role as any) || 'user')
                return new Response(null, {
                    status: 302,
                    headers: {
                        Location: "/dashboard?action=confirm_social_avatar&provider=twitter",
                    },
                })
            }

            const userId = randomUUID()
            const originalProfilePic = twitterUser.profile_image_url?.replace('_normal', '')

            await db.insert(users).values({
                id: userId,
                twitterId: twitterUser.id,
                email: placeholderEmail,
                name: twitterUser.name,
                firstName: twitterUser.name.split(' ')[0],
                lastName: twitterUser.name.split(' ').slice(1).join(' '),
                profilePictureUrl: originalProfilePic,
                twitterProfilePictureUrl: originalProfilePic,
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
