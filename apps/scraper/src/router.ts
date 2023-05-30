import { publicProcedure, router } from './trpc'
import { z } from 'zod'
import { createGOB } from './scraper'
import { getEnvVariable } from '@jobs/api-util/env'

const gob = createGOB(getEnvVariable('GOB_SESSION'), getEnvVariable('GOB_CSRF_TOKEN'))

export const appRouter = router({
  filter: publicProcedure
    .input(
      z.object({
        salary: z.array(z.number().min(0).positive(), z.number().positive().max(40000)),
        remote: z.boolean().default(false),
        offset: z.number().gte(0),
      })
    )
    .query(async opts => {
      const { jobs, meta } = await gob.navJobs(opts.input.salary, opts.input.offset, opts.input.remote)
      return { jobs, meta }
    }),
  getJob: publicProcedure
    .input(z.string({ description: 'Job slug', required_error: 'slug is required' }))
    .query(async opts => gob.getJob(opts.input)),
  search: publicProcedure.input(z.string({ description: 'Search term' })).query(async opts => gob.search(opts.input)),
})

export type AppRouter = typeof appRouter
