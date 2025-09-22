import { randomBytes } from 'node:crypto'

export function randomToken(len = 24) {
  return randomBytes(len).toString('base64url')
}
