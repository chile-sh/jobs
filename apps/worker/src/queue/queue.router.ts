import { publicProcedure, router } from '../trpc'
import { run } from './queue.controller'

export const queueRouter = router({
  run: publicProcedure.query(async () => {
    run()
    return { status: 200 }
  }),
})

export type AppRouter = typeof queueRouter
