import { runScraper } from './scraper'
import { runInsertDb } from './insert-db'

export { runScraper, runInsertDb }

export const runAll = () => {
  runScraper()
  runInsertDb()
}
