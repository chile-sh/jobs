import { publicProcedure, router } from '../trpc'
import { z } from 'zod'
import { createJob } from './job.model'
import { toJson } from '@/../../../packages/db'

export const jobRouter = router({
  insertJob: publicProcedure
    .input(
      z.object({
        title: z.string(),
        url: z.string().url(),
        company: z.object({
          name: z.string(),
          slug: z.string(),
          logo: z.string(),
        }),
        countries: z.string().optional().nullable(),
        area: z.string(),
        cities: z.string().optional().nullable(),
        date: z.date(),
        description: z.string(),
        level: z.string(),
        tags: z.array(z.string()).optional(),
        type: z.string(),
        salary: z
          .object({
            type: z.string(),
            min: z.number(),
            max: z.number(),
            unit: z.string(),
            currency: z.string(),
          })
          .optional(),
        remote: z
          .object({
            hybrid: z.boolean(),
            local: z.boolean(),
            temporarily: z.boolean(),
            modality: z.string().optional().nullable(),
            zone: z.string().optional().nullable(),
          })
          .nullable(),
        meta: z.object({
          ext_id: z.number(),
          user_id: z.number(),
          perks: z.array(z.string()),
          allows_quick_apply: z.boolean(),
          applications: z.number().optional(),
          hidden: z.boolean(),
          is_hot: z.boolean(),
          pinned: z.boolean(),
          recommended: z.boolean(),
          last_checked: z.tuple([z.string(), z.union([z.string(), z.number()])]).optional(),
          github_required: z.boolean(),
          linkedin_required: z.boolean(),
          portfolio_required: z.boolean(),
          replies_in: z.tuple([z.string(), z.number()]).rest(z.number()).optional(),
          requires_applying_in: z.string().optional(),
        }),
      })
    )
    .mutation(async opts => {
      const { input } = opts
      const insertedJob = await createJob(
        {
          url: input.url,
          area: input.area,
          description: input.description,
          level: input.level,
          remote_hybrid: input.remote?.hybrid,
          remote_local: input.remote?.local,
          remote_modality: input.remote?.modality,
          remote_temporarily: input.remote?.temporarily,
          remote_zone: input.remote?.zone,
          title: input.title,
          type: input.type,
          date: input.date.toDateString(),
          salary_currency: input.salary?.currency,
          salary_max: input.salary?.max,
          salary_min: input.salary?.min,
          salary_type: input.salary?.type,
          salary_unit: input.salary?.unit,
          meta: toJson(input.meta),
        },
        {
          company: input.company,
          country: input.countries,
          city: input.cities,
        }
      )

      return {
        result: insertedJob,
      }
    }),
})
