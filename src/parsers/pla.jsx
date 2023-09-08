import { GridActionsCellItem } from '@mui/x-data-grid'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'

import { ENTRY_TYPE } from '../constant'
import { b64_to_utf8 } from '../util'

const columns = [
  { field: 'name', sortable: false, headerName: 'Name', flex: 0.2 },
  {
    field: 'type',
    sortable: false,
    headerName: 'Type',
    valueFormatter({ value }) {
      return ENTRY_TYPE[value]
    }
  },
  {
    field: 'source',
    headerName: 'Source',
    sortable: false,
    flex: 1,
    renderCell(params) {
      return (
        <pre>
          <code>{params.value}</code>
        </pre>
      )
    }
  },
  {
    field: 'actions',
    type: 'actions',
    getActions: params => [
      <GridActionsCellItem
        title="Copy to clipboard"
        key="copy"
        icon={<ContentCopyIcon title="Copy to clipboard" />}
        onClick={() => navigator.clipboard.writeText(params.row.source)}
      />
    ]
  }
]

export const extension = 'pla'

/**
 * @param {File} file
 */
export async function handle(file) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(await file.text(), 'application/xml')

  const entries = doc.documentElement.querySelectorAll('GraphNode')

  const rows = Array.from(entries).map(entry => {
    const [type, ...nameParts] = entry
      .querySelector('data')
      .getAttribute('first')
      .split('_')
    const name = nameParts.join('_')

    const source = b64_to_utf8(entry.querySelector('NodeText').textContent)

    return { name, type, source }
  })

  return { rows, columns, rowIdProp: 'name' }
}
