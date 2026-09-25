// vitest/config re-exports Vite's defineConfig with the `test` option typed
// and validated, so a typo in the test setup fails loudly.
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
})
