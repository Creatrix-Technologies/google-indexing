import { defineConfig } from '@playwright/test'

// Drives the real Vue app (Vite on 5173) against the real API (5161) with Docker SQL, Mailpit and the Google stub.
// Start those first (see tests/README in the API repo), then: npx playwright test
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  reporter: [['list']],
})
