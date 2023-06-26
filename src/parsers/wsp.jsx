import ini from 'ini'

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
  }
]

export const type = 'Application/wsp'

export function handle(content) {
  const parsed = ini.decode(content)

  const keys = Object.keys(parsed).filter(key =>
    /Wsp\\Window_\d+\\ChartManager\\Strategy\\StrategyATPersistHelper/.test(key)
  )

  const rows = keys.map(key => ({
    strategyName: parsed[key].StrategyName.toString(),
    symbolName: parsed[key].SymbolName.toString()
  }))

  return { rows, columns, rowIdProp: 'strategyName' }
}
