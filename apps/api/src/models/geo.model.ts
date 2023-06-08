import { db, NewCountry, eq, inArray, cities, countries, jobsToCities } from '@jobs/db'

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
    .where(eq(cities.countryId, countryId))
    .execute()

  return city
}

export const createCity = async (name: string, countryId: number) => {
  const [inserted] = await db.insert(cities).values({ name, countryId }).returning().execute()
  return inserted
}

export const getPlacesByCityIds = async (cityIds: number[]) => {
  return db
    .select({
      countryId: countries.id,
      cityId: cities.id,
      cityName: cities.name,
      countryName: countries.name,
    })
    .from(cities)
    .innerJoin(countries, eq(cities.countryId, countries.id))
    .where(inArray(cities.id, cityIds))
}

export const getCitiesByJobIds = async (jobIds: number[]) => {
  return db
    .select({
      cityId: cities.id,
      jobId: jobsToCities.jobId,
    })
    .from(jobsToCities)
    .innerJoin(cities, eq(jobsToCities.cityId, cities.id))
    .where(inArray(jobsToCities.jobId, jobIds))
}
