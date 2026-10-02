import { expect, test } from '@playwright/test'

test('keeps both languages reachable and marks the active page with fallback fonts', async ({ page }, testInfo) => {
  await page.route('https://fonts.googleapis.com/**', (route) => route.fulfill({ body: '', contentType: 'text/css' }))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  // Existing projects also exercise the unchanged desktop and tablet header.
  if (testInfo.project.name === 'mobile') await page.setViewportSize({ width: 320, height: 568 })
  await page.goto('/#pflanze/bergpalme')
  for (const language of ['English', 'Deutsch']) {
    await page.locator('.locales').getByRole('button', { name: language, exact: true }).click()
    for (const button of await page.locator('.masthead button').all()) {
      const box = await button.boundingBox()
      expect(box).not.toBeNull()
      expect(box!.x).toBeGreaterThanOrEqual(0)
      expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width)
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const active = page.locator('.pages button[aria-current="page"]')
    await expect(active).toHaveCount(1)
    await expect(active).not.toHaveCSS('border-bottom-color', 'rgba(0, 0, 0, 0)')
    await page.locator('.pages button').nth(1).click()
    await expect(page.locator('.pages button').nth(1)).toHaveAttribute('aria-current', 'page')
    await expect(page.locator('.pages button').nth(1)).not.toHaveCSS('border-bottom-color', 'rgba(0, 0, 0, 0)')
    await page.locator('.pages button').first().click()
  }
  await page.getByRole('radio', { name: 'Wurzeln', exact: true }).click()
  await expect(page.locator('.pages button[aria-current="page"]')).toHaveCSS('color', 'rgb(241, 238, 221)')
  await expect(page.locator('.pages button:not([aria-current])')).not.toHaveCSS('color', 'rgb(241, 238, 221)')
})
