import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { name } from './package.json'

// https://vitejs.dev/config/
export default defineConfig({
  base: `/${name}/`,
  plugins: [react()]
})
