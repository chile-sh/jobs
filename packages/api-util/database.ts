import { Pool } from 'pg'
import { validateEnv, envalid, getEnvVariable } from './env'
import { Kysely, PostgresDialect, ColumnType, Generated } from 'kysely'

validateEnv({
  POSTGRES_HOST: envalid.str(),
  POSTGRES_USER: envalid.str(),
  POSTGRES_PASSWORD: envalid.str(),
  POSTGRES_DB: envalid.str({ default: 'jobs' }),
})

export * as pg from 'pg'
export * as kysely from 'kysely'

export interface CountryTable {
  id: Generated<number>
  name: string
}

export interface CompanyTable {
  id: Generated<number>
  name: string
  slug: string
  logo: string | null
}

export interface JobTable {
  id: Generated<number>
  company_id: number
  country_id: number
  area: string // programming, design, ...
  cities: string | null
  date: ColumnType<Date, string | undefined, never>
  description_headline: string
  description: string
  level: string // senior, ssr, ...
  tags: string[] | null
  title: string
  type: string // FULL_TIME
  remote: {
    hybrid: boolean
    local: boolean
    modality: string
    temporarily_remote: boolean
    zone: string | null
  } | null
  salary: {
    type: string | null // net, gross
    min: number | null
    max: number | null
    unit: string // MONTH
    currency: string // USD, CLP
  }
  meta: {
    ext_id: number
    user_id: number
    url: string
    allows_quick_apply: boolean
    applications: number | null
    hidden: boolean
    is_hot: boolean
    pinned: boolean
    recommended: boolean
    lastChecked: [string, string | number] | null
    github_required: boolean
    linkedin_required: boolean
    portfolio_required: boolean
    repliesIn: [string, number, number?] | null
    requiresApplyingIn: string | null
  }
}

interface Database {
  country: CountryTable
  job: JobTable
  company: CompanyTable
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
