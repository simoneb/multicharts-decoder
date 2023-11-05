import ini from 'ini'
import { Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material'

const columns = [
  {
    field: 'strategyName',
    flex: 1,
    headerName: 'Strategy Name'
  },
  {
    field: 'symbolName',
    flex: 1,
    headerName: 'Symbol Name'
  },
  {
    field: 'autoTrading',
    headerName: 'Auto Trading',
    align: 'center',
    valueFormatter({ value }) {
      return /true/i.test(value) ? '✅' : '❌'
    }
  },
  {
    field: 'contracts',
    headerName: 'Contracts',
    align: 'center'
  },
  {
    field: 'charts',
    flex: 2,
    headerName: 'Charts',
    renderCell(params) {
      return (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Symbol</TableCell>
              <TableCell>Timeframe</TableCell>
              <TableCell>Session</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {params.value.flat().map((chart, i) => (
              <TableRow key={i}>
                <TableCell>{chart.symbol}</TableCell>
                <TableCell>{chart.timeframe}</TableCell>
                <TableCell>{chart.sessionName}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )
    }
  }
]

export const extension = 'wsp'

function getIds(parsed, regexp) {
  return Array.from(
    new Set(
      Object.keys(parsed)
        .map(key => {
          const match = key.match(regexp)
          if (match) {
            return parseInt(match[1])
          }
        })
        .filter(w => !isNaN(w))
    )
  )
}

function getCharts(parsed, windowId) {
  const chartIds = getIds(
    parsed,
    new RegExp(`Wsp\\\\Window_${windowId}\\\\ChartManager\\\\Chart_(\\d+)`)
  )

  return chartIds.map(chartId => {
    const seriesIds = getIds(
      parsed,
      new RegExp(
        `Wsp\\\\Window_${windowId}\\\\ChartManager\\\\Chart_${chartId}\\\\Series_(\\d+)`
      )
    )

    return seriesIds
      .map(seriesId => {
        const dataSeriesRequest =
          parsed[
            `Wsp\\Window_${windowId}\\ChartManager\\Chart_${chartId}\\Series_${seriesId}\\DataSeries\\Request`
          ]

        if (dataSeriesRequest) {
          return {
            symbol: dataSeriesRequest?.Symbol,
            timeframe: `${dataSeriesRequest?.ResolutionSizeId} ${dataSeriesRequest?.ResolutionName}`,
            sessionName: dataSeriesRequest?.SessionsName
          }
        }
      })
      .filter(Boolean)
  })
}

/**
 * @param {File} file
 */
export async function handle(file) {
  const parsed = ini.decode(await file.text())

  const windowNumbers = new Set(
    Object.keys(parsed)
      .map(key => {
        const match = key.match(/Wsp\\Window_(\d+)/)
        if (match) {
          return parseInt(match[1])
        }
      })
      .filter(w => !isNaN(w))
  )

  const rows = Array.from(windowNumbers)
    .sort()
    .map(windowId => {
      const strategyData = `Wsp\\Window_${windowId}\\ChartManager\\Strategy\\StrategyATPersistHelper`
      const charts = getCharts(parsed, windowId)

      const contractsKey = Object.keys(parsed).find(
        key =>
          key.localeCompare(
            `Wsp\\Window_${windowId}\\ChartManager\\Strategy\\SignalObject_0\\SignalHelper\\InputHelper\\Input_myContracts`,
            undefined,
            { sensitivity: 'base' }
          ) === 0
      )

      return {
        strategyName: parsed[strategyData].StrategyName,
        symbolName: parsed[strategyData].SymbolName,
        autoTrading: parsed[strategyData].ATOn,
        charts,
        contracts: parsed[contractsKey]?.Value
      }
    })

  return { rows, columns, rowIdProp: 'strategyName' }
}
