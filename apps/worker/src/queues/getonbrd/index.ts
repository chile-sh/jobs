import { runScraper } from './scraper'
import { runInsertDb } from './insert-db'
import { insertQueue, jobQueue, navQueue, rangeQueue } from './queues'

export { runScraper, runInsertDb }

export const emptyQueues = async () => {
  await jobQueue.empty()
  await navQueue.empty()
  await rangeQueue.empty()
  await insertQueue.empty()
}

export const runAll = async () => {
  await emptyQueues()

  runScraper()
  runInsertDb()
}
