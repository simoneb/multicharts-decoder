import { extension as plaExtension, handle as handlePla } from './pla'
import { extension as wspExtension, handle as handleWsp } from './wsp'
import {
  extension as performanceReportExtension,
  handle as handlePerformanceReport
} from './performance-report'

export const extensions = [
  plaExtension,
  wspExtension,
  performanceReportExtension
]

/**
 * @param {File} file
 */
export function handle(file) {
  const extension = file.name.split('.').pop()

  switch (extension) {
    case plaExtension:
      return handlePla(file)
    case wspExtension:
      return handleWsp(file)
    case performanceReportExtension:
      return handlePerformanceReport(file)
    default:
      throw new Error(`Unknown file extension: ${extension}`)
  }
}
