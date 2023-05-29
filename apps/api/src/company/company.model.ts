import { db } from '@jobs/db'
import type { Company, InsertableCompany } from '@jobs/db/tables'

export const findCompanyByName = async (name: string): Promise<Company | undefined> =>
  db.selectFrom('company').selectAll().where('name', '=', name).executeTakeFirst()

export const createCompany = async (company: InsertableCompany) =>
  db.insertInto('company').values(company).returning('id').executeTakeFirstOrThrow()
