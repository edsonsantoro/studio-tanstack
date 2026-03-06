import { createFileRoute } from '@tanstack/react-router'
import { generateState, generateCodeVerifier } from "arctic"
import { getGoogleClient } from "@/lib/auth/google"
import { setCookie } from '@tanstack/react-start/server'

export const Route = createFileRoute('/login/google')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const google = getGoogleClient(request)
        if (!google) {
            return new Response("Google OAuth not configured", { status: 500 })
        }

        const state = generateState()
        const codeVerifier = generateCodeVerifier()
        const url = await google.createAuthorizationURL(state, codeVerifier, ["profile", "email"])

        setCookie('google_oauth_state', state, {
            path: "/",
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            maxAge: 60 * 10,
            sameSite: "lax",
        })
        setCookie('google_code_verifier', codeVerifier, {
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
