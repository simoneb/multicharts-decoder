import { read, utils } from 'xlsx'

export const SHEETS = {
  strategyAnalysis: 'Strategy Analysis',
  tradeAnalysis: 'Trade Analysis',
  listOfTrades: 'List of Trades',
  settings: 'Settings'
}

export const KEYS = {
  returnOnMaxDD: 'Return on Max Strategy Drawdown',
  percentInTheMarket: 'Percent in the Market',
  startDate: 'Start Date',
  endDate: 'End Date',
  totalTrades: 'Total # of Trades'
}

const rules = [
  function returnOnMaxStrategyDD({ strategyAnalysis }) {
    if (!strategyAnalysis) return

    const row = strategyAnalysis.find(row => row[0] === KEYS.returnOnMaxDD)

    if (!row) return

    const value = row[1]

    if (value < 10) {
      return {
        type: 'error',
        message: `Return on Max Strategy Drawdown is ${value.toFixed(
          2
        )}. It should be at least 10`
      }
    }

    return {
      type: 'success',
      message: `Return on Max Strategy Drawdown is ${value.toFixed(2)}`
    }
  },
  function percentInTheMarket({ strategyAnalysis }) {
    if (!strategyAnalysis) return

    const row = strategyAnalysis.find(
      ([key]) => key === KEYS.percentInTheMarket
    )

    if (!row) return

    const value = parseFloat(row[1])

    if (value > 50) {
      return {
        type: 'error',
        message: `The strategy spends more than 50% of the time in the market`
      }
    }

    return {
      type: 'success',
      message: `The strategy spends ${value.toFixed(
        2
      )}% of the time in the market`
    }
  },
  function numberOfTrades({ tradeAnalysis, settings }) {
    if (!tradeAnalysis || !settings) return

    const startDate = settings.find(row => row[0] === KEYS.startDate)[1]
    const endDate = settings.find(row => row[0] === KEYS.endDate)[1]
    const numberOfYears = (endDate - startDate) / (1000 * 60 * 60 * 24 * 365)

    const totalTrades = tradeAnalysis.find(
      row => row[0] === KEYS.totalTrades
    )[1]

    const tradesPerYear = totalTrades / numberOfYears

    if (tradesPerYear < 2 * 12) {
      return {
        type: 'warning',
        message: `The strategy does less than 2 trades per month`
      }
    }

    if (tradesPerYear > 10 * 12) {
      return {
        type: 'warning',
        message: `The strategy does more than 10 trades per month`
      }
    }

    return {
      type: 'success',
      message: `The strategy does ${tradesPerYear.toFixed(2)} trades per year`
    }
  },
  function tradeDuration({ listOfTrades }) {
    if (!listOfTrades) return

    const trades = listOfTrades.slice(3)

    for (let i = 0; i < trades.length - 1; i += 2) {
      const entry = trades[i]
      const exit = trades[i + 1]
      const duration = (exit[4] - entry[4]) / (1000 * 60 * 60 * 24)

      if (duration > 10) {
        return {
          type: 'warning',
          message: `Trade #${i / 2 + 1} lasts more than 10 days`
        }
      }
    }

    return {
      type: 'success',
      message: `All trades last less than 10 days`
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
        case 'success':
          return '✅'
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

  const rows = runRules(data)

  return { rows, columns, rowIdProp: 'message' }
}

export function runRules(data) {
  return rules.map(rule => rule(data)).filter(Boolean)
}
