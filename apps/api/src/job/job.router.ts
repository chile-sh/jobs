import { publicProcedure, router } from '../trpc'
import { z } from 'zod'

export const jobRouter = router({
  getJob: publicProcedure.input(z.number()).query(async opts => {
    return {
      result: opts.input,
    }
  }),
})
