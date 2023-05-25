import { queueRouter } from './queue/queue.router'
import { router } from './trpc'

export const appRouter = router({
  queue: queueRouter,
})

export type AppRouter = typeof appRouter
