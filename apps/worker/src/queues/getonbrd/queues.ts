import Queue from 'bull'
import { bullDefaultConfig } from '../../bull-config'

export const insertQueue = new Queue('insert jobs', bullDefaultConfig)
export const navQueue = new Queue('fetch salaries', bullDefaultConfig)
export const jobQueue = new Queue('fetch jobs', bullDefaultConfig)
export const rangeQueue = new Queue('salary range', bullDefaultConfig)
