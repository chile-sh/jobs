import parseDuration from 'parse-duration'

export const waitFor = (t: string | number) => new Promise(resolve => setTimeout(resolve, parseDuration(`${t}`, 'ms')))

export { parseDuration }
