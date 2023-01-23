import { useCallback, useState } from 'react'
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid'
import { Box, CssBaseline, Typography } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'

import { ENTRY_TYPE } from './constant'
import useFileDrop from './hooks/useFileDrop'
import { b64_to_utf8 } from './util'

const root = window

const COLUMNS = [
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

function App() {
  const [data, setData] = useState()

  const processFile = useCallback(content => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'application/xml')

    const entries = doc.documentElement.querySelectorAll('GraphNode')

    const rows = Array.from(entries).map(entry => {
      const [type, ...nameParts] = entry
        .querySelector('data')
        .getAttribute('first')
        .split('_')
      const name = nameParts.join('_')

      const source = b64_to_utf8(entry.querySelector('NodeText').textContent)

      console.log(name, type, source)

      return { name, type, source }
    })

    setData({ rows })
  }, [])

  useFileDrop(root, processFile)

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <CssBaseline />
      {data ? (
        <DataGrid
          getRowHeight={() => 'auto'}
          getRowId={r => r.name}
          rows={data.rows}
          columns={COLUMNS}
        />
      ) : (
        <Typography variant="h3">Drop a .pla file anywhere</Typography>
      )}
    </Box>
  )
}

export default App
