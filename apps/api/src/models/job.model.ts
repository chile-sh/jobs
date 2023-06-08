import { createCompany, findCompanyByName } from '@/models/company.model'
import { createCountry, createCity, findCountryByName, findCityByName } from '@/models/geo.model'
import {
  db,
  ilike,
  jobsToCities,
  jobs as jobsT,
  jobSources,
  jobsToTags,
  NewCompany,
  NewJob,
  sql,
  tags as tagsT,
} from '@jobs/db'

import type { SetOptional } from 'type-fest'

const MAX_LIMIT = 50

export const getSources = async () => {
  return db.select().from(jobSources).execute()
}

interface NavParams {
  limit?: number
  offset?: number
  filters?: {
    search?: string
  }
}

export const navJobs = async ({ limit = 25, offset = 0, filters }: NavParams = {}) => {
  if (limit > MAX_LIMIT) throw Error(`max limit: ${MAX_LIMIT}`)

  const jobs = await db.query.jobs.findMany({
    where: filters?.search ? ilike(jobsT.title, filters?.search as string) : undefined,
    offset,
    limit,
    columns: {
      createdAt: false,
      sourceId: false,
    },
    with: {
      company: {
        columns: {
          createdAt: false,
          id: false,
        },
      },
      source: {
        columns: {
          id: false,
          createdAt: false,
        },
      },
      jobsToCities: {
        columns: {},
        with: {
          city: {
            columns: {
              countryId: false,
              name: true,
            },
            with: {
              countries: {
                columns: {
                  name: true,
                },
              },
            },
          },
        },
      },
      jobsToTags: {
        columns: {},
        with: {
          tag: {
            columns: {
              tag: true,
              description: true,
            },
          },
        },
      },
    },
  })

  return jobs.map(job => ({
    ...job,
    tags: job.jobsToTags.map(obj => obj.tag),
    places: job.jobsToCities.map(obj => ({
      city: obj.city.name,
      country: obj.city.countries.name,
    })),
    jobsToTags: undefined,
    jobsToCities: undefined,
  }))
}

navJobs({ filters: { search: 'Senior Data Scientist' } }).then(obj => console.log(JSON.stringify(obj, null, 2)))

export const createJob = async (
  jobData: SetOptional<NewJob, 'companyId'>,
  {
    company,
    places,
    tags,
  }: {
    company: NewCompany
    places?: {
      country?: string
      cities?: string[]
    }[]
    tags?: string[]
  }
) => {
  const cityIds: Set<number> = new Set()

  // TODO: optimize
  if (places?.length) {
    for (const { cities, country } of places) {
      if (!country) continue

      const foundCountry = await findCountryByName(country)
      const countryId = foundCountry?.id ?? (await createCountry({ name: country })).id

      if (!cities) continue

      for (const cityName of cities) {
        const foundCity = foundCountry ? await findCityByName(cityName, foundCountry.id) : undefined
        const cityId = foundCity?.id ?? (await createCity(cityName, countryId)).id
        cityIds.add(cityId)
      }
    }
  }

  const foundCompany = await findCompanyByName(company.name)
  const companyId = foundCompany?.id ?? (await createCompany(company)).id

  const insertValues = {
    ...jobData,
    companyId,
  }

  // Create the job
  const [insertedJob] = await db
    .insert(jobsT)
    .values(insertValues)
    .onConflictDoUpdate({ target: jobsT.url, set: insertValues })
    .returning()
    .execute()

  // TODO: optimize
  if (tags?.length) {
    for (const tagName of tags) {
      const [{ id: tagId }] = await db
        .insert(tagsT)
        .values({ tag: tagName })
        .onConflictDoUpdate({ target: tagsT.tag, set: { tag: tagName } })
        .returning()
        .execute()

      await db
        .insert(jobsToTags)
        .values({ jobId: insertedJob.id, tagId: tagId })
        .onConflictDoUpdate({
          target: [jobsToTags.jobId, jobsToTags.tagId],
          set: { jobId: insertedJob.id, tagId },
        })
        .execute()
    }
  }

  const citiesToUpsert = [...cityIds].map(id => ({ enabled: true, cityId: id, jobId: insertedJob.id }))

  if (citiesToUpsert.length) {
    await db
      .insert(jobsToCities)
      .values(citiesToUpsert)
      .onConflictDoUpdate({
        target: [jobsToCities.jobId, jobsToCities.cityId],
        set: {
          cityId: sql`excluded.city_id`,
          jobId: sql`excluded.job_id`,
        },
      })
      .execute()
  }

  return { insertedJob }
}
