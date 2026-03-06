import { createFileRoute } from '@tanstack/react-router'
import { generateState, generateCodeVerifier } from "arctic"
import { getTwitterClient } from "@/lib/auth/twitter"
import { setCookie } from '@tanstack/react-start/server'

export const Route = createFileRoute('/login/twitter')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const twitter = getTwitterClient(request)
        if (!twitter) {
            return new Response("Twitter OAuth not configured", { status: 500 })
        }

        const state = generateState()
        const codeVerifier = generateCodeVerifier()
        const url = await twitter.createAuthorizationURL(state, codeVerifier, ["tweet.read", "users.read", "offline.access"])

        setCookie('twitter_oauth_state', state, {
            path: "/",
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            maxAge: 60 * 10,
            sameSite: "lax",
        })
        setCookie('twitter_code_verifier', codeVerifier, {
            path: "/",
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            maxAge: 60 * 10,
            sameSite: "lax",
        })

        return new Response(null, {
          status: 302,
          headers: {
            Location: url.toString(),
          },
        })
      },
    },
  },
})
