import { createCompany, findCompanyByName } from '@/company/company.model'
import { createCountry, findCountryByName } from '@/country/country.model'
import type { InsertableCompany, InsertableCountry } from '@jobs/db/tables'
import { db } from '@jobs/db'

import { JobData } from '@/types'

export const createJob = async (jobData: JobData, company: InsertableCompany, country: InsertableCountry) => {
  const foundCompany = await findCompanyByName(company.name)
  const foundCountry = await findCountryByName(country.name)

  const companyId = foundCompany?.id ?? (await createCompany(company)).id
  const countryId = foundCountry?.id ?? (await createCountry(country)).id
  console.log({ companyId })
  console.log({ countryId })

  // Create the job
  await db
    .insertInto('job')
    .values({
      ...jobData,
      company_id: companyId,
      country_id: countryId,
    })
    .execute()
}
