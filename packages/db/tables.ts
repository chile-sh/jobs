import { ColumnType, Generated, Selectable, Insertable, Updateable, RawBuilder } from 'kysely'

// -------------------------------------------------
// Country
export interface CountryTable {
  id: Generated<number>
  name?: string
}

export type Country = Selectable<CountryTable>
export type InsertableCountry = Insertable<CountryTable>
export type UpdateableCountry = Updateable<CountryTable>

// -------------------------------------------------
// City
export interface CityTable {
  id: Generated<number>
  name?: string
  country_id?: number
}

export type City = Selectable<CityTable>
export type InsertableCity = Insertable<CityTable>
export type UpdateableCity = Updateable<CityTable>

// -------------------------------------------------
// JobCity
export interface JobCityTable {
  id: Generated<number>
  city_id: number
  job_id: number
}

export type JobCity = Selectable<JobCityTable>
export type InsertableJobCity = Insertable<JobCityTable>
export type UpdateableJobCity = Updateable<JobCityTable>

// -------------------------------------------------
// Company
export interface CompanyTable {
  id: Generated<number>
  name: string
  slug: string
  logo?: string
}

export type Company = Selectable<CompanyTable>
export type InsertableCompany = Insertable<CompanyTable>
export type UpdateableCompany = Updateable<CompanyTable>

// -------------------------------------------------
// Tag
export interface TagTable {
  id: Generated<number>
  tag: string
  description?: string
}

export type Tag = Selectable<TagTable>
export type InsertableTag = Insertable<TagTable>
export type UpdateableTag = Updateable<TagTable>

// -------------------------------------------------
// Job
export interface JobTable {
  id: Generated<number>
  url: string
  city_id?: number | null
  company_id: number
  area: string // programming, design, ...
  date: ColumnType<Date, string | undefined, never>
  description: string
  level: string // senior, ssr, ...
  places?: RawBuilder<string[]>
  tags?: number[]
  title: string
  type: string // FULL_TIME
  salary_guess?: boolean
  salary_type?: string // net, gross
  salary_min?: number
  salary_max?: number
  salary_unit?: string // MONTH
  salary_currency?: string // USD, CLP
  source?: string // getonbrd, economicos, ...
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
    location_objects?: { flag_url?: string; sentence?: string; tenant_name?: string }[]
    locations_to_sentence?: string
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

export type Job = Selectable<JobTable>
export type InsertableJob = Insertable<JobTable>
export type UpdateableJob = Updateable<JobTable>

// -------------------------------------------------
// JobTag
export interface JobTagTable {
  id: Generated<number>
  tag_id: number
  job_id: number
}

export type JobTag = Selectable<JobTagTable>
export type InsertableJobTag = Insertable<JobTagTable>
export type UpdateableJobTag = Updateable<JobTagTable>
