/* eslint-disable @typescript-eslint/no-explicit-any */

// TODO: use proper types instead of any

export type JobErrors = 'JobNotFoundError'
export type ErrorCode = 'UnknownError' | JobErrors

export type ErrorStatus = 400 | 401 | 403 | 404 | 409 | 500

export class ControllerError extends Error {
  readonly status: ErrorStatus
  readonly code: ErrorCode
  readonly data?: any

  constructor(status: ErrorStatus, code: ErrorCode, message: string, data?: any) {
    super(message)
    this.status = status
    this.code = code
    this.data = data
  }

  toJSON() {
    return {
      error: { code: this.code, message: this.message },
    }
  }
}
