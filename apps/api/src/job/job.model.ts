import { createCompany, findCompanyByName } from '@/company/company.model'
import { createCountry, findCountryByName } from '@/country/country.model'
import type { InsertableCompany, InsertableCountry } from '@jobs/db/tables'
import { db } from '@jobs/db'

import { InsertableJob } from '@jobs/db/tables'
import type { SetOptional } from 'type-fest'

type InsertJobData = SetOptional<InsertableJob, 'company_id' | 'country_id'>

export const createJob = async (jobData: InsertJobData, company: InsertableCompany, country: InsertableCountry) => {
  const foundCompany = await findCompanyByName(company.name)
  const foundCountry = await findCountryByName(country.name)

  const companyId = foundCompany?.id ?? (await createCompany(company)).id
  const countryId = foundCountry?.id ?? (await createCountry(country)).id

  // Create the job
  return db
    .insertInto('job')
    .values({
      ...jobData,
      company_id: companyId,
      country_id: countryId,
    })
    .returningAll()
    .executeTakeFirstOrThrow()
}
