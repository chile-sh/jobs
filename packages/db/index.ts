import { Pool } from 'pg'
import { validateEnv, envalid, getEnvVariable } from '@jobs/api-util/env'
import { Kysely, PostgresDialect, RawBuilder, sql } from 'kysely'
import { CompanyTable, CountryTable, JobTable, TagTable } from './tables'

validateEnv({
  POSTGRES_HOST: envalid.str(),
  POSTGRES_USER: envalid.str(),
  POSTGRES_PASSWORD: envalid.str(),
  POSTGRES_DB: envalid.str({ default: 'jobs' }),
})

export * as pg from 'pg'
export * as kysely from 'kysely'

interface Database {
  country: CountryTable
  job: JobTable
  company: CompanyTable
  tag: TagTable
}

export function toJson<T>(obj: T): RawBuilder<T> {
  return sql`${JSON.stringify(obj)}`
}

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      host: getEnvVariable('POSTGRES_HOST'),
      database: getEnvVariable('POSTGRES_DB'),
      user: getEnvVariable('POSTGRES_USER'),
      password: getEnvVariable('POSTGRES_PASSWORD'),
    }),
  }),
})
