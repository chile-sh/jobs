import { db } from '..'

export const run = async () => {
  await db
    .insertInto('job_source')
    .values([{ name: 'getonboard', slug: 'getonbrd', url: 'https://www.getonbrd.com' }])
    .execute()
}
