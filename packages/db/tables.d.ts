import { ColumnType, Generated, Selectable, Insertable, Updateable, RawBuilder } from 'kysely'

export interface CountryTable {
  id: Generated<number>
  name: string
  code: string
}

export interface CityTable {
  id: Generated<number>
  name: string
  country_id: number
}

export interface CompanyTable {
  id: Generated<number>
  name: string
  slug: string
  logo: string | null
}

export interface TagTable {
  id: Generated<number>
  tag: string
  description: string
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
  tags: number[] | null
  title: string
  type: string // FULL_TIME
  salary_type: string | null // net, gross
  salary_min: number | null
  salary_max: number | null
  salary_unit: string | null // MONTH
  salary_currency: string // USD, CLP
  remote_hybrid: boolean
  remote_local: boolean
  remote_temporarily: boolean
  remote_modality: string
  remote_zone: string | null
  meta: RawBuilder<{
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
  } | null>
}

// Country
export type Country = Selectable<CountryTable>
export type InsertableCountry = Insertable<CountryTable>
export type UpdateableCountry = Updateable<CountryTable>

// Company
export type Company = Selectable<CompanyTable>
export type InsertableCompany = Insertable<CompanyTable>
export type UpdateableCompany = Updateable<CompanyTable>

// Job
export type Job = Selectable<JobTable>
export type InsertableJob = Insertable<JobTable>
export type UpdateableJob = Updateable<JobTable>

// Tag
export type Tag = Selectable<TagTable>
export type InsertableTag = Insertable<TagTable>
export type UpdateableTag = Updateable<TagTable>
