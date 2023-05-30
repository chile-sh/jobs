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
        country: z.object({
          name: z.string(),
          code: z.string(),
        }),
        area: z.string(),
        cities: z.string(),
        date: z.date(),
        description: z.object({
          text: z.string(),
          headline: z.string(),
        }),
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
            modality: z.string(),
            zone: z.string(),
          })
          .nullable(),
        meta: z.object({
          ext_id: z.number(),
          user_id: z.number(),
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
          replies_in: z.tuple([z.string(), z.number(), z.number().optional()]).optional(),
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
          description: input.description.text,
          description_headline: input.description.headline,
          level: input.level,
          remote_hybrid: input.remote?.hybrid,
          remote_local: input.remote?.local,
          remote_modality: input.remote?.modality,
          remote_temporarily: input.remote?.temporarily,
          remote_zone: input.remote?.zone,
          title: input.title,
          type: input.type,
          cities: input.cities,
          date: input.date.toISOString(),
          salary_currency: input.salary?.currency,
          salary_max: input.salary?.max,
          salary_min: input.salary?.min,
          salary_type: input.salary?.type,
          salary_unit: input.salary?.unit,
          meta: toJson(input.meta),
        },
        { name: input.company.name, logo: input.company.logo, slug: input.company.slug },
        { name: input.country.name, code: input.country.code }
      )

      return {
        result: insertedJob,
      }
    }),
})
