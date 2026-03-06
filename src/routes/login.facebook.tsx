import { createFileRoute } from '@tanstack/react-router'
import { generateState } from "arctic"
import { getFacebookClient } from "@/lib/auth/facebook"
import { setCookie } from '@tanstack/react-start/server'

export const Route = createFileRoute('/login/facebook')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const facebook = getFacebookClient(request)
        if (!facebook) {
            return new Response("Facebook OAuth not configured", { status: 500 })
        }

        const state = generateState()
        const url = await facebook.createAuthorizationURL(state, ["public_profile", "email"])

        setCookie('facebook_oauth_state', state, {
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
