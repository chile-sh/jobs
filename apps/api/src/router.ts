import { jobRouter } from './job/job.router'
import { router } from './trpc'

export const appRouter = router({
  job: jobRouter,
})

export type AppRouter = typeof appRouter
