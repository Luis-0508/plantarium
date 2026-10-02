import { expect, test } from '@playwright/test'

test('keeps extended specimen values within their chart bounds', async ({ page }, testInfo) => {
  await page.goto('/tests/browser/fixtures/charts.html')
  await expect(page.getByRole('img', { name: 'Extended temperature' })).toBeVisible()
  const temperatureBands = await page.getByRole('img', { name: 'Extended temperature' }).locator('rect').evaluateAll(
    (rects) => rects.map((rect) => ({ x: Number(rect.getAttribute('x')), width: Number(rect.getAttribute('width')) })),
  )
  expect(temperatureBands.every(({ x, width }) => x >= 10 && x + width <= 310)).toBe(true)
  const ph = await page.locator('.ph__range').evaluate((element) => ({ left: parseFloat((element as HTMLElement).style.left), width: parseFloat((element as HTMLElement).style.width) }))
  expect(ph.left).toBeGreaterThanOrEqual(0)
  expect(ph.left + ph.width).toBeLessThanOrEqual(100)
  await expect(page.locator('.ph__ends')).toHaveText('213')
  const rootGuide = await page.locator('.root-diagram__depth').evaluate((element) => ({
    x1: Number(element.getAttribute('x1')), x2: Number(element.getAttribute('x2')), y: Number(element.getAttribute('y1')),
    height: (element.closest('svg') as SVGSVGElement).viewBox.baseVal.height,
  }))
  expect(rootGuide.x1).toBeGreaterThan(0)
  expect(rootGuide.x2).toBeLessThan(200)
  expect(rootGuide.y).toBeLessThan(rootGuide.height - 14)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('extended-charts.png'), fullPage: true })
})
