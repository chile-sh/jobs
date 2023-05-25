import { cleanEnv, port, str } from 'envalid'

export * as envalid from 'envalid'

export const validateEnv = (vars = {}, env = process.env) => {
  cleanEnv(env, {
    NODE_ENV: str(),
    PORT: port(),
    ...vars,
  })
}

export function getEnvVariable(name: string): string {
  const value = process.env[name]

  if (value === undefined || value === null) {
    throw new Error(`environment variable ${name} not found`)
  }

  return value
}
