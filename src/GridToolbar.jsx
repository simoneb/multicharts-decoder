import { GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid'

export default function GridToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarExport printOptions={{ disableToolbarButton: true }} />
    </GridToolbarContainer>
  )
}
