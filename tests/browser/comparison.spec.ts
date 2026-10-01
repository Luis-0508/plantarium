import { expect, test } from '@playwright/test'

test('scales tall plants and extended traits without shrinking a larger lineup', async ({ page }, testInfo) => {
  await page.goto('/tests/browser/fixtures/comparison.html')
  await expect(page.getByRole('heading', { name: 'Pflanzen im Vergleich' })).toBeVisible()
  await expect(page.locator('.lineup text').filter({ hasText: '500 cm' })).toBeVisible()
  await expect(page.locator('.lineup__plant')).toHaveCount(6)
  await expect(page.getByText('Angaben prüfen', { exact: false })).toHaveCount(0)
  const laneValues = await page.locator('.trait__dot').evaluateAll((elements) => elements.map((el) => parseFloat((el as HTMLElement).style.left)))
  expect(laneValues.every((v) => v >= 0 && v <= 100)).toBe(true)
  const scroller = page.getByRole('region', { name: 'Größenvergleich, horizontal scrollbar' })
  const sizes = await scroller.evaluate((el) => ({ scroll: el.scrollWidth, client: el.clientWidth }))
  expect(sizes.scroll).toBeGreaterThan(sizes.client)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('comparison-expanded.png'), fullPage: true })
  const lastPlant = page.getByRole('button', { name: /Testpflanze 6:.*im 3D-Modell öffnen/ })
  await lastPlant.focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#fixture-5$/)
})

test('keeps the current comparison readable', async ({ page }, testInfo) => {
  await page.route('https://fonts.googleapis.com/**', (route) => route.fulfill({ body: '', contentType: 'text/css' }))
  await page.goto('/#vergleich')
  await expect(page.getByRole('heading', { name: 'Pflanzen im Vergleich' })).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('comparison.png'), fullPage: true })
})
