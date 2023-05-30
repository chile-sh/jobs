import { db } from '@jobs/db'
import type { Country, InsertableCountry } from '@jobs/db/tables'

export const findCountryByName = async (name: string): Promise<Country | undefined> => {
  return db.selectFrom('country').selectAll().where('name', '=', name).executeTakeFirst()
}

export const createCountry = async (country: InsertableCountry) => {
  return db.insertInto('country').values(country).returning('id').executeTakeFirstOrThrow()
}
