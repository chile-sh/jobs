import { publicProcedure, router } from '../trpc'
import { z } from 'zod'
import { createJob } from '@/models/job.model'
import { toJson } from '@jobs/db'

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
        area: z.string(),
        date: z.date(),
        description: z.string(),
        level: z.string(),
        placesArr: z
          .array(z.object({ cities: z.array(z.string()).optional(), country: z.string().optional() }))
          .optional(),
        places: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
        type: z.string(),
        salary: z
          .object({
            type: z.string(),
            min: z.number(),
            max: z.number(),
            unit: z.string(),
            currency: z.string(),
            guess: z.boolean().optional().default(false),
          })
          .optional(),
        source: z.string(),
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
          location_objects: z
            .array(z.object({ flag_url: z.string(), sentence: z.string(), tenant_name: z.string() }))
            .optional(),
          locations_to_sentence: z.string().optional(),
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
          places: input.places ? toJson(input.places) : undefined,
          remote_hybrid: input.remote?.hybrid,
          remote_local: input.remote?.local,
          remote_modality: input.remote?.modality,
          remote_temporarily: input.remote?.temporarily,
          remote_zone: input.remote?.zone,
          title: input.title,
          type: input.type,
          date: input.date.toDateString(),
          salary_guess: input.salary?.guess,
          salary_currency: input.salary?.currency,
          salary_max: input.salary?.max,
          salary_min: input.salary?.min,
          salary_type: input.salary?.type,
          salary_unit: input.salary?.unit,
          source: input.source,
          meta: toJson(input.meta),
        },
        {
          company: input.company,
          places: input.placesArr,
          tags: input.tags,
        }
      )

      return insertedJob
    }),
})
