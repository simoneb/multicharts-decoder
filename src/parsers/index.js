import { type as plaType, handle as handlePla } from './pla'
import { type as wspType, handle as handleWsp } from './wsp'

export const types = [plaType, wspType]

export function handle(content, type) {
  switch (type) {
    case plaType:
      return handlePla(content)
    case wspType:
      return handleWsp(content)
    default:
      throw new Error(`Unknown file type: ${type}`)
  }
}
