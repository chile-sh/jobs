import { createCompany, findCompanyByName } from '@/models/company.model'
import {
  createCountry,
  createCity,
  findCountryByName,
  findCityByName,
  getCitiesByJobIds,
  getPlacesByCityIds,
} from '@/models/geo.model'
import type { InsertableCompany } from '@jobs/db/tables'
import { db } from '@jobs/db'

import { InsertableJob } from '@jobs/db/tables'
import type { SetOptional } from 'type-fest'
import { getTagsByJobIds } from './tag.model'

type InsertJobData = SetOptional<InsertableJob, 'company_id'>

const MAX_LIMIT = 50

// Fetch cities and countries info from jobCities

const getJobIdsByTags = async (tags: string[]) => {
  return db
    .selectFrom('job_tag as jt')
    .innerJoin('tag as t', 't.id', 'jt.tag_id')
    .where('t.tag', 'in', tags)
    .select('jt.job_id')
    .execute()
}

export const getSources = async () => {
  return db.selectFrom('job_source').selectAll().execute()
}

export const navJobs = async ({
  limit = 25,
  offset = 0,
  filters,
}: {
  limit?: number
  offset?: number
  filters?: {
    source?: string
    search?: string
    tags?: string[]
  }
}) => {
  if (limit > MAX_LIMIT) throw Error(`max limit: ${MAX_LIMIT}`)

  let jobsQry = db.selectFrom('job')

  if (filters?.search?.length) {
    jobsQry = jobsQry.where('job.title', 'ilike', filters.search)
  }

  if (filters?.source) {
    jobsQry = jobsQry.where('source_id', '=', eb =>
      eb
        .selectFrom('job_source')
        .select('id')
        .where('name', '=', filters.source as string)
    )
  }

  let filteredJobIdsByTags: number[] | undefined
  if (filters?.tags?.length) {
    filteredJobIdsByTags = (await getJobIdsByTags(filters.tags)).map(job => job.job_id)
  }

  if (filteredJobIdsByTags?.length) {
    jobsQry = jobsQry.where('job.id', 'in', filteredJobIdsByTags)
  }

  const jobs = await jobsQry.selectAll('job').offset(offset).limit(limit).execute()

  if (!jobs.length) return []
  const jobIds = jobs.map(job => job.id)

  // Fetch only cities from the jobs results
  const jobCities = await getCitiesByJobIds(jobIds)

  // Fetch cities and countries info from jobCities
  const places = await getPlacesByCityIds(jobCities.map(jc => jc.cityId))
  const tags = await getTagsByJobIds(jobIds)

  const jobIdTagMap: Map<number, Set<string>> = new Map()
  const cityIdMap: Map<number, Set<{ country?: string; city?: string }>> = new Map()

  // cities to Map
  for (const place of places) {
    const val = cityIdMap.get(place.city_id)
    const obj = { country: place.country_name, city: place.city_name }
    if (val) {
      val.add(obj)
      continue
    }
    cityIdMap.set(place.city_id, new Set([obj]))
  }

  // tags to Map
  for (const tag of tags) {
    const val = jobIdTagMap.get(tag.job_id)
    if (val) {
      val.add(tag.tag)
      continue
    }
    jobIdTagMap.set(tag.job_id, new Set([tag.tag]))
  }

  return {
    jobs: jobs.map(job => {
      return {
        ...job,
        places: jobCities
          .filter(cty => cty.jobId === job.id)
          .map(cty => [...(cityIdMap.get(cty.cityId)?.values() || [])])
          .flat(),
        tags: [...(jobIdTagMap.get(job.id)?.values() || [])],
      }
    }),
  }
}

export const createJob = async (
  jobData: InsertJobData,
  {
    company,
    places,
    tags,
  }: {
    company: InsertableCompany
    places?: {
      country?: string
      cities?: string[]
    }[]
    tags?: string[]
  }
) => {
  const cityIds: Set<number> = new Set()

  if (places?.length) {
    for (const { cities, country } of places) {
      if (!country) continue

      const foundCountry = await findCountryByName(country)
      const countryId = foundCountry?.id ?? (await createCountry({ name: country })).id

      if (!cities) continue

      for (const city of cities) {
        const foundCity = foundCountry ? await findCityByName(city, foundCountry.id) : undefined
        const cityId = foundCity?.id ?? (await createCity(city, countryId)).id
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
  const createJobQry = db
    .insertInto('job')
    .values(insertValues)
    .returningAll()
    .onConflict(oc => oc.column('url').doUpdateSet(insertValues))

  const insertedJob = await createJobQry.executeTakeFirstOrThrow()

  if (tags?.length) {
    for (const tag of tags) {
      // TODO: make only one query
      const { id } = await db
        .insertInto('tag')
        .values({ tag })
        .returningAll()
        .onConflict(oc => oc.column('tag').doUpdateSet({ tag }))
        .executeTakeFirstOrThrow()

      await db
        .insertInto('job_tag')
        .values({ job_id: insertedJob.id, tag_id: id })
        .returningAll()
        .onConflict(oc => oc.constraint('job_id_tag_id_uniq').doUpdateSet({ job_id: insertedJob.id, tag_id: id }))
        .execute()
    }
  }

  // TODO: update/upsert cities instead of adding
  const citiesToUpsert = [...cityIds].map(id => ({ enabled: true, city_id: id, job_id: insertedJob.id }))

  if (citiesToUpsert.length) {
    await db
      .insertInto('job_city')
      .values(citiesToUpsert)
      .onConflict(oc =>
        oc.constraint('job_id_city_id_uniq').doUpdateSet(eb => ({
          city_id: eb.ref('excluded.city_id'),
          job_id: eb.ref('excluded.job_id'),
        }))
      )
      .execute()
  }

  return { insertedJob }
}
