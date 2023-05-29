import { Country, InsertableCountry } from '@jobs/db/tables'
import { db } from '@jobs/db'

export const findCountryByName = async (name: string): Promise<Country | undefined> =>
  db.selectFrom('country').selectAll().where('name', '=', name).executeTakeFirst()

export const createCountry = async (country: InsertableCountry) =>
  db.insertInto('country').values(country).returning('id').executeTakeFirstOrThrow()
