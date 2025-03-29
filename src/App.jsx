import { useCallback, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Box, CssBaseline, Typography } from '@mui/material'

import useFileDrop from './hooks/useFileDrop'
import { handle, extensions } from './parsers'
import GridToolbar from './GridToolbar'

function App() {
  const [data, setData] = useState()

  useFileDrop(
    window,
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
          slots={{ toolbar: GridToolbar }}
        />
      ) : (
        <Typography variant="h3">
          Drop a {extensions.slice(0, extensions.length - 1).join(', ')} or{' '}
          {extensions.at(-1)} file anywhere
        </Typography>
      )}
    </Box>
  )
}

export default App
