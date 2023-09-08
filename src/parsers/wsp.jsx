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

export const extension = 'wsp'

/**
 * @param {File} file
 */
export async function handle(file) {
  const parsed = ini.decode(await file.text())

  const keys = Object.keys(parsed).filter(key =>
    /Wsp\\Window_\d+\\ChartManager\\Strategy\\StrategyATPersistHelper/.test(key)
  )

  const rows = keys.map(key => ({
    strategyName: parsed[key].StrategyName.toString(),
    symbolName: parsed[key].SymbolName.toString()
  }))

  return { rows, columns, rowIdProp: 'strategyName' }
}
