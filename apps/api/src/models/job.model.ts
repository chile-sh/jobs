import { createCompany, findCompanyByName } from '@/models/company.model'
import { createCountry, createCity, findCountryByName, findCityByName } from '@/models/geo.model'
import {
  cities,
  companies,
  countries,
  db,
  eq,
  ilike,
  jobCities,
  jobs as jobsT,
  jobSources,
  jobTags,
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

export const navJobs = async ({
  limit = 25,
  offset = 0,
  filters,
}: {
  limit?: number
  offset?: number
  filters?: {
    search?: string
  }
}) => {
  if (limit > MAX_LIMIT) throw Error(`max limit: ${MAX_LIMIT}`)

  let jobsQry = db.select({ job: jobsT, company: companies, cities, countries }).from(jobsT)

  if (filters?.search?.length) {
    jobsQry = jobsQry.where(ilike(jobsT.title, filters.search))
  }

  const jobs = await jobsQry
    .leftJoin(companies, eq(jobsT.company_id, companies.id))
    .leftJoin(jobCities, eq(jobCities.job_id, jobsT.id))
    .leftJoin(cities, eq(cities.id, jobCities.city_id))
    .offset(offset)
    .limit(limit)
    .execute()

  return jobs
}

export const createJob = async (
  jobData: SetOptional<NewJob, 'company_id'>,
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
    company_id: companyId,
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
        .insert(jobTags)
        .values({ job_id: insertedJob.id, tag_id: tagId })
        .onConflictDoUpdate({
          target: [jobTags.job_id, jobTags.tag_id],
          set: { job_id: insertedJob.id, tag_id: tagId },
        })
        .execute()
    }
  }

  const citiesToUpsert = [...cityIds].map(id => ({ enabled: true, city_id: id, job_id: insertedJob.id }))

  if (citiesToUpsert.length) {
    await db
      .insert(jobCities)
      .values(citiesToUpsert)
      .onConflictDoUpdate({
        target: [jobCities.job_id, jobCities.city_id],
        set: {
          city_id: sql`excluded.city_id`,
          job_id: sql`excluded.job_id`,
        },
      })
      .execute()
  }

  return { insertedJob }
}
