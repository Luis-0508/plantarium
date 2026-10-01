import { expect, test } from '@playwright/test'

test('renders the specimen and its information without application errors', async ({ page }, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  // External font availability is unrelated to application reliability.
  await page.route('https://fonts.googleapis.com/**', (route) => route.fulfill({ body: '', contentType: 'text/css' }))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#pflanze/bergpalme')
  await expect(page.getByRole('heading', { name: 'Bergpalme', exact: true })).toBeVisible()
  await expect(page.getByRole('complementary', { name: 'Steckbrief Bergpalme' })).toBeAttached()
  await expect(page.locator('canvas')).toBeVisible()
  await expect(page.getByText('Präparat wird vorbereitet …')).toHaveCount(0)
  await page.getByRole('radio', { name: 'Wurzeln', exact: true }).click()
  await expect(page.locator('.ruler-note').filter({ hasText: 'Wurzeltiefe' })).toBeVisible()
  if (!process.env.CI) await page.screenshot({ path: testInfo.outputPath('roots-parlor-palm.png') })
  expect(errors).toEqual([])
})
