import { load } from 'cheerio'
import { NodeHtmlMarkdown } from 'node-html-markdown'
import { getUnit, txt, extractFromArr, PropMapRules } from './helpers'

import type { Job, JobData, JobSearchMeta } from './types'

export const createGOB = (session: string, token: string) => {
  const navJobs = async (
    salary: [number, number] | number[] | null,
    offset = 0,
    remote = false
  ): Promise<{ jobs: Job[]; meta: JobSearchMeta }> => {
    const BASE_URL = `https://www.getonbrd.com/webpros/search_jobs.json?offset=${offset}`
    const finalUrl = `${BASE_URL}&webpro[remote_jobs]=${remote ? 'true' : 'false'}${
      salary ? `&webpro[min_salary]=${salary[0]}&webpro[max_salary]=${salary[1]}` : ''
    }`

    const res = await fetch(finalUrl, {
      headers: {
        'X-CSRF-Token': token,
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'es-US,es;q=0.9,es-419;q=0.8,en;q=0.7',
        Cookie: `_getonboard_session=${session};`,
      },
      method: 'POST',
    })

    return res.json()
  }

  const getJob = async (slug: string): Promise<JobData> => {
    const cleanSlug = slug.replace(/\/?jobs\/?/, '')
    const res = await fetch(`https://www.getonbrd.com/jobs/${cleanSlug}`)
    const html = await res.text()
    const $ = load(html)

    const _title = $('.gb-landing-cover__title')
    const title = txt(_title.find('[itemprop="title"]'))
    const level = txt($('[itemprop="qualifications"]'))
    const jobArea = txt($('[itemprop="qualifications"] ~ .color-inherit'))
    const type = txt($('[itemprop="employmentType"]'))
    const _salary = $('[itemprop="baseSalary"]')
    const _location = txt($('[itemprop="address"]'))
    const tags = $('[itemprop="skills"] > a')
      .map((_, el) => txt($(el)))
      .get()
    const _company = $('[itemprop="hiringOrganization"]')
    const company = {
      slug: _company
        .find('a')
        .attr('href')
        ?.match(/companies\/(.+)/)?.[1] as string,
      name: txt(_company.find('[itemprop="name"]')),
      logo: txt(_company.find('[itemprop="logo"]')),
    }
    const date = txt(_company.find('time'))
    const url = $(`link[itemprop='url']`).attr('href') as string
    const locModality = _location.toLowerCase().match(/remote|hybrid/)?.[0]
    const location = {
      modality: locModality,
      place: _location.match(/((?!remote|hybrid|\(|\s).)*/)?.[0] || locModality,
    }

    const min = _salary.find('[itemprop="minValue"]').attr('content')
    const max = _salary.find('[itemprop="maxValue"]').attr('content')

    const salary = !!(min && max)
      ? {
          type: _salary.find('.hide-on-small-mobile').text().match(/gross/i) ? 'gross' : 'net',
          min: +min,
          max: +max,
          unit: _salary.find('[itemprop="unitText"]').attr('content') as string,
          currency: _salary.find('[itemprop="currency"]').attr('content') as string,
        }
      : undefined

    const otherInfo = $('.size0')
      .first()
      .text()
      .split(/\n\n/)
      .map(l => l.replace(/\n/g, ' ').trim())
      .filter(l => l)

    const description = NodeHtmlMarkdown.translate($('[itemprop="description"]').html() as string)

    const propMapRules: PropMapRules = {
      applications: [/(\d+) app/i, match => +match],
      repliesIn: [
        /repl.*? (.+)/i,
        match => {
          const unit = getUnit(match)
          if (match.includes('same')) return [unit, 0]
          const inStr = match.match(/in (\d*)/)?.[1]
          if (match.match(/in \d*/)) return [unit, inStr ? +inStr : undefined]
          const split = match.split('and').map(s => s.match(/(\d+)/)?.[1])
          return [unit, ...split.map(Number)]
        },
      ],
      lastChecked: [
        /last check.*? (.+)/i,
        match => {
          const unit = getUnit(match)
          const [, digit] = match.match(/(\d+)/) || []
          return [unit, +digit || match]
        },
      ],
      requiresApplyingIn: [/applying in (.+)/i, match => match.toLowerCase()],
    }

    const job: JobData = {
      url,
      date,
      title,
      area: jobArea,
      level,
      type,
      salary,
      description,
      location,
      tags,
      company,
      ...extractFromArr(otherInfo, propMapRules),
    }

    return job
  }

  return {
    navJobs,
    getJob,
  }
}
