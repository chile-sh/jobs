import { createCompany, findCompanyByName } from '@/models/company.model'
import { createCountry, findCountryByName } from '@/models/country.model'
import { createCity, findCityByName } from '@/models/city.model'
import type { InsertableCompany } from '@jobs/db/tables'
import { db } from '@jobs/db'

import { InsertableJob } from '@jobs/db/tables'
import type { SetOptional } from 'type-fest'

type InsertJobData = SetOptional<InsertableJob, 'company_id'>

export const createJob = async (
  jobData: InsertJobData,
  {
    company,
    places,
    tags,
  }: { company: InsertableCompany; places?: { country?: string; cities?: string[] }[]; tags?: string[] }
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
