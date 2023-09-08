import { read, utils } from 'xlsx'

const SHEETS = {
  strategyAnalysis: 'Strategy Analysis',
  tradeAnalysis: 'Trade Analysis',
  settings: 'Settings'
}

const HEADINGS = {
  returnOnMaxStrategyDD: 'Return on Max Strategy Drawdown'
}

const rules = [
  function returnOnMaxStrategyDD({ strategyAnalysis }) {
    const row = strategyAnalysis.find(
      row => row[0] === HEADINGS.returnOnMaxStrategyDD
    )

    const value = row[1]

    if (value < 10) {
      return {
        type: 'error',
        message: `Return on Max Strategy Drawdown is ${value.toFixed(
          2
        )}. It should be at least 10.`
      }
    }
  },
  function numberOfTrades({ tradeAnalysis, settings }) {
    const startDate = settings.find(row => row[0] === 'Start Date')[1]
    const endDate = settings.find(row => row[0] === 'End Date')[1]
    const numberOfYears = (endDate - startDate) / (1000 * 60 * 60 * 24 * 365)

    const totalTrades = tradeAnalysis.find(
      row => row[0] === 'Total # of Trades'
    )[1]

    const tradesPerYear = totalTrades / numberOfYears

    if (tradesPerYear < 2 * 12) {
      return {
        type: 'warning',
        message: `The strategy does  less than 2 trades per month.`
      }
    }

    if (tradesPerYear > 10 * 12) {
      return {
        type: 'warning',
        message: `The strategy does more than 10 trades per month.`
      }
    }
  }
]

const columns = [
  {
    field: 'type',
    headerName: 'Type',
    valueFormatter({ value }) {
      switch (value) {
        case 'error':
          return '❌'
        case 'warning':
          return '⚠️'
        default:
          return 'ℹ️'
      }
    }
  },
  {
    field: 'message',
    flex: 1,
    headerName: 'Message'
  }
]

export const extension = 'xlsx'

/**
 * @param {File} file
 */
export async function handle(file) {
  const workbook = read(await file.arrayBuffer(), { cellDates: true })

  const data = Object.entries(SHEETS)
    .map(([sheetKey, sheetName]) => {
      const sheet = workbook.Sheets[sheetName]
      const json = utils.sheet_to_json(sheet, { header: 1 })
      return [sheetKey, json]
    })
    .reduce((acc, [key, value]) => {
      acc[key] = value
      return acc
    }, {})

  const rows = rules.map(rule => rule(data)).filter(Boolean)

  return { rows, columns, rowIdProp: 'message' }
}
