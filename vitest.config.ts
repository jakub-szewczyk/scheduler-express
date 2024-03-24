/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    hookTimeout: 180000,
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
})
