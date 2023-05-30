import { ValidatorSpec, cleanEnv, port, str } from 'envalid'

export * as envalid from 'envalid'

export const validateEnv = <T>(
  vars: {
    [K in keyof T]: ValidatorSpec<T[K]>
  },
  env = process.env
) =>
  cleanEnv(env, {
    NODE_ENV: str({ choices: ['development', 'test', 'production', 'staging'] }),
    PORT: port(),
    ...vars,
  })

export const env = validateEnv({
  REDIS_HOST: str(),
})
