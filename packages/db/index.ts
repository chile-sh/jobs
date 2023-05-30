import { Pool } from 'pg'
import { Kysely, PostgresDialect, RawBuilder, sql } from 'kysely'
import { CompanyTable, CountryTable, JobTable, TagTable } from './tables'
import { env } from './env'

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
      host: env.POSTGRES_HOST,
      database: env.POSTGRES_DB,
      user: env.POSTGRES_USER,
      password: env.POSTGRES_PASSWORD,
    }),
  }),
})
