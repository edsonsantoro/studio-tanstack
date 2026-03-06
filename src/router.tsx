import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import '@/globals.css'

export function getRouter() {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
  })
  return router
}
