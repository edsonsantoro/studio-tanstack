import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server'
import { createServerEntry } from '@tanstack/react-start/server-entry'
import { getRouter } from './router'

const handler = createStartHandler({
  createRouter: getRouter,
  getStreamHandler: defaultStreamHandler,
})

export default createServerEntry({
  fetch: handler,
})
