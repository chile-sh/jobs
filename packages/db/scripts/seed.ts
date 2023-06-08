#!/usr/bin/env tsx

import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import { db } from '../src'

const cmd = yargs(hideBin(process.argv))
  .option('seed', {
    alias: 's',
    type: 'string',
    description: 'run seed',
  })
  .example('$0 -s init_job_sources', 'use seeds/init_job_sources.ts')
  .parseSync()

const runSeed = async () => {
  const { seed } = cmd

  if (seed) {
    const seedRunner: { run: () => Promise<void> } = await import(`../seeds/${seed}`)
    await seedRunner.run()
    console.log(`seed ${seed} run succesfully`)

    process.exit(0)
  }

  console.log('--seed param is missing')
}

runSeed()
