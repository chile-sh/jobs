import { db, NewCountry, eq, inArray, cities, countries, jobCities } from '@jobs/db'

export const findCountryByName = async (name: string) => {
  const [country] = await db.select().from(countries).where(eq(countries.name, name)).execute()
  return country
}

export const createCountry = async (country: NewCountry) => {
  const [inserted] = await db.insert(countries).values(country).returning().execute()
  return inserted
}

export const findCityByName = async (name: string, countryId: number) => {
  const [city] = await db
    .select()
    .from(cities)
    .where(eq(cities.name, name))
    .where(eq(cities.country_id, countryId))
    .execute()

  return city
}

export const createCity = async (name: string, countryId: number) => {
  const [inserted] = await db.insert(cities).values({ name, country_id: countryId }).returning().execute()
  return inserted
}

export const getPlacesByCityIds = async (cityIds: number[]) => {
  return db
    .select({
      country_id: countries.id,
      city_id: cities.id,
      city_name: cities.name,
      country_name: countries.name,
    })
    .from(cities)
    .innerJoin(countries, eq(cities.country_id, countries.id))
    .where(inArray(cities.id, cityIds))
}

export const getCitiesByJobIds = async (jobIds: number[]) => {
  return db
    .select({
      cityId: cities.id,
      jobId: jobCities.job_id,
    })
    .from(jobCities)
    .innerJoin(cities, eq(jobCities.city_id, cities.id))
    .where(inArray(jobCities.job_id, jobIds))
}
