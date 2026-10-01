import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.route('https://fonts.googleapis.com/**', (route) => route.fulfill({ body: '', contentType: 'text/css' }))
  await page.emulateMedia({ reducedMotion: 'reduce' })
})

test('defaults to English, switches to German and remembers the choice', async ({ page }) => {
  await page.goto('/#pflanze/bergpalme')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.getByRole('heading', { name: 'Parlor Palm', exact: true })).toBeVisible()
  await expect(page.getByRole('complementary', { name: 'Specimen sheet: Parlor Palm' })).toBeAttached()
  const languages = page.getByRole('group', { name: 'Language' })
  await expect(languages.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'true')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)

  await languages.getByRole('button', { name: 'Deutsch' }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'de')
  await expect(page).toHaveTitle('Plantarium – Digitales Herbarium')
  await expect(page.getByRole('heading', { name: 'Bergpalme', exact: true })).toBeVisible()
  await expect(page.getByRole('complementary', { name: 'Steckbrief Bergpalme' })).toBeAttached()
  await expect(page.getByRole('radio', { name: 'Wurzeln', exact: true })).toBeVisible()
  await expect(page.locator('.ph__value')).toHaveText('5,8–6,8')

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Bergpalme', exact: true })).toBeVisible()
  await page.getByRole('group', { name: 'Sprache' }).getByRole('button', { name: 'English' }).click()
  await expect(page.getByRole('heading', { name: 'Parlor Palm', exact: true })).toBeVisible()
  await expect(page.locator('.ph__value')).toHaveText('5.8–6.8')
  await expect(page).toHaveTitle('Plantarium – Digital Herbarium')
})
