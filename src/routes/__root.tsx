import { createRootRoute, Outlet, ScrollRestoration, HeadContent, Scripts } from '@tanstack/react-router'
import * as React from 'react'
import appCss from '@/globals.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Comunidade Sem Limites',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      { 
        rel: 'icon', 
        type: 'image/svg+xml', 
        href: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23208080%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22m8 3 4 8 5-5 5 15H2L8 3z%22/></svg>' 
      }
    ]
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
      <ScrollRestoration />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
