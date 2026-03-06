import {
  createStartHandler,
  defaultStreamHandler,
  defineHandlerCallback,
} from '@tanstack/react-start/server'
import { createServerEntry } from '@tanstack/react-start/server-entry'

const handler = createStartHandler(
  defineHandlerCallback((ctx) => {
    return defaultStreamHandler(ctx)
  })
)

export default createServerEntry({ fetch: handler })
