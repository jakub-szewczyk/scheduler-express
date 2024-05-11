/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    include: ['src/tests/**/*.test.ts'],
    setupFiles: ['src/tests/setup.ts'],
    poolOptions: {
      threads: { singleThread: true },
    },
    hookTimeout: 180000,
  },
})
