import { useCallback, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Box, CssBaseline, Typography } from '@mui/material'

import useFileDrop from './hooks/useFileDrop'
import { handle, extensions } from './parsers'

const root = window

function App() {
  const [data, setData] = useState()

  useFileDrop(
    root,
    useCallback(async file => setData(await handle(file)), [])
  )

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
          Drop a {extensions.join(' or ')} file anywhere
        </Typography>
      )}
    </Box>
  )
}

export default App
