import { expect, test } from 'vitest'
import fs from 'fs'
import path from 'path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

import { handle } from '../src/parsers/wsp.jsx'

test('parses the report correctly', async () => {
  expect(
    await handle(
      new File(
        [fs.readFileSync(path.join(__dirname, 'workspace.wsp'))],
        'workspace.wsp'
      )
    )
  ).toBeDefined()
})
