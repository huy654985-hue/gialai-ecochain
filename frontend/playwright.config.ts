import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  reporter: 'line',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'off',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'python -m uvicorn app.main:app --port 8000',
      cwd: '../backend',
      env: {
        PATH: process.env.PATH as string,
        DATABASE_URL: 'sqlite:///./e2e.db',
        DEMO_MODE: 'true',
        APP_ENV: 'test',
        SCHEDULER_ENABLED: 'false',
        RATE_LIMIT_PER_MINUTE: '1000',
        PYTHONPATH: '.',
      },
      port: 8000,
      reuseExistingServer: false,
      timeout: 120000,
    },
    {
      command: 'npx vite preview --port 4173 --strictPort',
      port: 4173,
      reuseExistingServer: false,
      timeout: 120000,
    },
  ],
})
