import { ValidatorSpec, cleanEnv, port, str, num, url } from 'envalid'

export { cleanEnv, port, str, num, url }

export * as envalid from 'envalid'

export const validateEnv = <T>(
  vars: {
    [K in keyof T]: ValidatorSpec<T[K]>
  },
  env = process.env
) =>
  cleanEnv(env, {
    NODE_ENV: str({ choices: ['development', 'test', 'production', 'staging'] }),
    ...vars,
  })
