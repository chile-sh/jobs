import { createCompany, findCompanyByName } from '@/company/company.model'
import { createCountry, findCountryByName } from '@/country/country.model'
import { createCity, findCityByName } from '@/city/city.model'
import type { InsertableCompany, InsertableCountry, InsertableCity } from '@jobs/db/tables'
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

  // Create the job
  return db
    .insertInto('job')
    .values({
      ...jobData,
      company_id: companyId,
      city_id: cityId,
    })
    .returningAll()
    .executeTakeFirstOrThrow()
}
