import { defineConfig } from '@playwright/test'
import development from './playwright.config.ts'

/** Exercise actual bundled chunks; development-only fixtures stay on the dev server. */
export default defineConfig({
  ...development,
  testMatch: ['**/production.spec.ts', '**/header.spec.ts'],
  testIgnore: [],
  outputDir: 'test-results/production',
  projects: development.projects?.filter((project) => project.name !== 'tablet'),
  use: { ...development.use, baseURL: 'http://127.0.0.1:4174' },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4174 --strictPort',
    url: 'http://127.0.0.1:4174',
    reuseExistingServer: false,
  },
})
