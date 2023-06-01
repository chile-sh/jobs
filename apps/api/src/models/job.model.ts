import { createCompany, findCompanyByName } from '@/models/company.model'
import { createCountry, findCountryByName } from '@/models/country.model'
import { createCity, findCityByName } from '@/models/city.model'
import type { InsertableCompany } from '@jobs/db/tables'
import { db } from '@jobs/db'

import { InsertableJob } from '@jobs/db/tables'
import type { SetOptional } from 'type-fest'

type InsertJobData = SetOptional<InsertableJob, 'company_id' | 'city_id'>

export const createJob = async (
  jobData: InsertJobData,
  { company, country, city }: { company: InsertableCompany; country?: string | null; city?: string | null }
) => {
  let countryId: number | undefined
  let cityId: number | undefined

  if (country && city) {
    const foundCountry = await findCountryByName(country)
    const foundCity = foundCountry ? await findCityByName(city, foundCountry.id) : undefined

    countryId = foundCountry?.id ?? (await createCountry({ name: country })).id
    cityId = foundCity?.id ?? (await createCity(city, countryId)).id
  }

  const foundCompany = await findCompanyByName(company.name)
  const companyId = foundCompany?.id ?? (await createCompany(company)).id

  const insertValues = {
    ...jobData,
    company_id: companyId,
    city_id: cityId,
  }

  // Create the job
  return db
    .insertInto('job')
    .values(insertValues)
    .returningAll()
    .onConflict(oc => oc.column('url').doUpdateSet(insertValues))
    .executeTakeFirstOrThrow()
}
