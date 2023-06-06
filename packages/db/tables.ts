import { ColumnType, Generated, Selectable, Insertable, Updateable, RawBuilder } from 'kysely'

export interface CountryTable {
  id: Generated<number>
  name?: string
}

export interface CityTable {
  id: Generated<number>
  name?: string
  country_id?: number
}

export interface CompanyTable {
  id: Generated<number>
  name: string
  slug: string
  logo?: string
}

export interface TagTable {
  id: Generated<number>
  tag: string
  description: string
}

export interface JobTable {
  id: Generated<number>
  url: string
  city_id?: number | null
  company_id: number
  area: string // programming, design, ...
  date: ColumnType<Date, string | undefined, never>
  description: string
  level: string // senior, ssr, ...
  tags?: number[]
  title: string
  type: string // FULL_TIME
  salary_guess?: boolean
  salary_type?: string // net, gross
  salary_min?: number
  salary_max?: number
  salary_unit?: string // MONTH
  salary_currency?: string // USD, CLP
  remote_hybrid?: boolean
  remote_local?: boolean
  remote_temporarily?: boolean
  remote_modality?: string | null
  remote_zone?: string | null
  meta?: RawBuilder<{
    ext_id: number
    user_id: number
    perks: string[]
    allows_quick_apply: boolean
    applications?: number
    hidden: boolean
    is_hot: boolean
    pinned: boolean
    recommended: boolean
    last_checked?: [string, string | number]
    github_required: boolean
    linkedin_required: boolean
    portfolio_required: boolean
    replies_in?: [string, number, ...number[]]
    requires_applying_in?: string
  }>
}

// Country
export type Country = Selectable<CountryTable>
export type InsertableCountry = Insertable<CountryTable>
export type UpdateableCountry = Updateable<CountryTable>

// City
export type City = Selectable<CityTable>
export type InsertableCity = Insertable<CityTable>
export type UpdateableCity = Updateable<CityTable>

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
