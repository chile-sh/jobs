import { db, jobSources } from '../src'

export const run = async () => {
  await db
    .insert(jobSources)
    .values([{ name: 'getonboard', slug: 'getonbrd', url: 'https://www.getonbrd.com' }])
    .execute()
}
