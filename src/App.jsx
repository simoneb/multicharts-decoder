import { useCallback, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Box, CssBaseline, Typography } from '@mui/material'

import useFileDrop from './hooks/useFileDrop'
import { handle, types } from './parsers'

const root = window

function App() {
  const [data, setData] = useState()

  const processFile = useCallback((content, type) => {
    setData(handle(content, type))
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
          getRowId={r => r[data.rowIdProp]}
          rows={data.rows}
          columns={data.columns}
        />
      ) : (
        <Typography variant="h3">
          Drop a {types.map(t => t.split('/')[1]).join(' or ')} file anywhere
        </Typography>
      )}
    </Box>
  )
}

export default App
