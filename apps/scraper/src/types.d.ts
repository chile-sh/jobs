export interface Job {
  allows_quick_apply: boolean
  boards?: string[]
  cities: string
  collapse_locations: boolean
  company: {
    name: string
    about: string
    url: string
  }
  countries: string
  description_headline: string
  display_as_annual: boolean
  divider: string
  github_required: boolean
  has_relocation_perk: boolean
  hidden: boolean
  hiring_company: string
  hiring_organization: string
  hybrid: boolean
  id: number
  is_board_job: boolean
  is_hot: boolean
  linkedin_required: boolean
  location_objects: {
    flag_url: string
    sentence: string
    tenant_name: string
  }[]
  locations_to_sentence_short: string
  locations_to_sentence: string
  logo_url: string
  max_salary?: number
  min_salary?: number
  new: boolean
  no_remote: boolean
  perks: string[]
  pinned: boolean
  portfolio_required: boolean
  published_at: string
  recommended: boolean
  remote_local: boolean
  remote_modality?: string | null
  remote_zone?: string | null
  remote: boolean
  salary_type?: string | null
  salary?: string | null
  seniority: string
  show_salary: boolean
  temporarily_remote: boolean
  title: string
  url: string
  user_id: number
}

export interface JobSearchMeta {
  jobs_count: number
  jobs_limit: number
  jobs_offset: number
  preferences: {
    category_ids: number[]
    companies_blacklist_ids: number[]
    following_company_ids: number[]
    max_salary: number | null
    min_salary: number | null
    modality_ids: number[]
    remote_jobs: boolean
    seniority_ids: number[]
    tag_ids: number[]
    tenant_ids: number[]
  }
  reset_results: boolean
}

export interface JobData {
  applications?: number
  area: string
  company: {
    slug: string
    name: string
    logo: string
  }
  date: string
  description: string
  lastChecked?: [string, number]
  level: string
  location: {
    modality?: string
    place?: string
  }
  repliesIn?: [string, number, ...number[]]
  requiresApplyingIn?: string
  salary?: {
    type: string
    min: number
    max: number
    unit: string
    currency: string
  }
  tags?: string[]
  title: string
  type: string
  url: string
}
