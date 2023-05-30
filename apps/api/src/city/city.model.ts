import { db } from '@jobs/db'
import type { City } from '@jobs/db/tables'

export const findCityByName = async (name: string, countryId: number): Promise<City | undefined> =>
  db.selectFrom('city').selectAll().where('name', '=', name).where('country_id', '=', countryId).executeTakeFirst()

export const createCity = async (name: string, countryId: number) =>
  db.insertInto('city').values({ name, country_id: countryId }).returning('id').executeTakeFirstOrThrow()
