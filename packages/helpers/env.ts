import { ValidatorSpec, cleanEnv, port, str } from 'envalid'

export { cleanEnv, port, str }

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
