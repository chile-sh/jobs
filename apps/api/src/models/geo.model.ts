import { db } from '@jobs/db'
import type { City } from '@jobs/db/tables'
import type { Country, InsertableCountry } from '@jobs/db/tables'

export const findCountryByName = async (name: string): Promise<Country | undefined> => {
  return db.selectFrom('country').selectAll().where('name', '=', name).executeTakeFirst()
}

export const createCountry = async (country: InsertableCountry) => {
  return db.insertInto('country').values(country).returning('id').executeTakeFirstOrThrow()
}

export const findCityByName = async (name: string, countryId: number): Promise<City | undefined> => {
  return db
    .selectFrom('city')
    .selectAll()
    .where('name', '=', name)
    .where('country_id', '=', countryId)
    .executeTakeFirst()
}

export const createCity = async (name: string, countryId: number) => {
  return db.insertInto('city').values({ name, country_id: countryId }).returning('id').executeTakeFirstOrThrow()
}

export const getPlacesByCityIds = async (cityIds: number[]) => {
  return db
    .selectFrom('city as cty')
    .innerJoin('country as c', 'c.id', 'cty.country_id')
    .select(['cty.country_id as country_id', 'cty.id as city_id', 'cty.name as city_name', 'c.name as country_name'])
    .where('cty.id', 'in', cityIds)
    .execute()
}

export const getCitiesByJobIds = async (jobIds: number[]) => {
  return db
    .selectFrom('job_city as jc')
    .innerJoin('city as cty', 'cty.id', 'city_id')
    .select(['cty.id as cityId', 'jc.job_id as jobId'])
    .where('jc.job_id', 'in', jobIds)
    .execute()
}
