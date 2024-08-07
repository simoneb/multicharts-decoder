import ini from 'ini'
import { Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material'
import { hex2a } from '../util'

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
    field: 'tif',
    headerName: 'TIF',
    valueFormatter(data) {
      switch (data?.value) {
        case 0:
          return 'DAY'
        case 1:
          return 'GTC'
        case 2:
          return 'IOC'
      }
    }
  },
  {
    field: 'defaultAccount',
    headerName: 'Default Account'
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
              <TableCell>Timezone</TableCell>
              <TableCell>Start date</TableCell>
              <TableCell>End date</TableCell>
              <TableCell>End anchored</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {params.value.flat().map((chart, i) => (
              <TableRow key={i}>
                <TableCell>{chart.symbol}</TableCell>
                <TableCell>{chart.timeframe}</TableCell>
                <TableCell>{chart.sessionName}</TableCell>
                <TableCell>{chart.timezone}</TableCell>
                <TableCell>{formatDate(chart.startDate)}</TableCell>
                <TableCell>{formatDate(chart.finishDate)}</TableCell>
                <TableCell>{chart.finishDateAnchored ? 'Yes' : 'No'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )
    }
  }
]

export const extension = 'wsp'

function formatDate(date) {
  return date.toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  })
}

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
            symbol: dataSeriesRequest.Symbol,
            timeframe: `${dataSeriesRequest.ResolutionSizeId} ${dataSeriesRequest.ResolutionName}`,
            sessionName: dataSeriesRequest.SessionsName,
            timezone: dataSeriesRequest.TimeZoneName,
            startDate: new Date(1899, 11, 30 + dataSeriesRequest.StartDateId),
            finishDate: new Date(1899, 11, 30 + dataSeriesRequest.FinishDateId),
            finishDateAnchored: dataSeriesRequest.AnchorFinishDate === '1'
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

  const windowNumbers = getIds(parsed, /Wsp\\Window_(\d+)/)

  const rows = windowNumbers.sort().map(windowId => {
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

    const brokerPluginsIds = getIds(
      parsed,
      new RegExp(
        `Wsp\\\\Window_${windowId}\\\\ChartManager\\\\Strategy\\\\MCBroker\\\\MCBrokerObject\\\\PluginsProxies\\\\MCPluginProxiesCollection\\\\Item_(\\d+)`
      )
    )

    console.log(brokerPluginsIds)

    const interactiveBrokersPluginId = brokerPluginsIds.find(
      id =>
        parsed[
          `Wsp\\Window_${windowId}\\ChartManager\\Strategy\\MCBroker\\MCBrokerObject\\PluginsProxies\\MCPluginProxiesCollection\\Item_${id}`
        ].Name === 'Interactive Brokers'
    )

    console.log(interactiveBrokersPluginId)

    const brokerPluginAdditionalInfo =
      parsed[
        `Wsp\\Window_${windowId}\\ChartManager\\Strategy\\MCBroker\\MCBrokerObject\\PluginsProxies\\MCPluginProxiesCollection\\Item_${interactiveBrokersPluginId}\\Proxy\\MCPluginProxy\\AdditionalInfo`
      ]

    const additionalInfo =
      brokerPluginAdditionalInfo &&
      ini.parse(
        hex2a(
          Object.keys(brokerPluginAdditionalInfo)
            .filter(k => !['PluginData', '{', '}'].includes(k))
            .join(' ')
            .split(' ')
            .join('')
        )
      )

    return {
      strategyName: parsed[strategyData].StrategyName,
      symbolName: parsed[strategyData].SymbolName,
      autoTrading: parsed[strategyData].ATOn,
      tif: additionalInfo?.AdditionalsParams.TIF,
      defaultAccount: additionalInfo?.AdditionalsParams.DefaultAccount,
      charts,
      contracts: parsed[contractsKey]?.Value
    }
  })

  return { rows, columns, rowIdProp: 'strategyName' }
}
