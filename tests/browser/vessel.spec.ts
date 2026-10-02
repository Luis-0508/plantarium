import { expect, test } from '@playwright/test'

test('releases each Vessel-owned geometry once and supports a StrictMode remount', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Geometry ownership does not depend on the viewport')
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/tests/browser/fixtures/vessel.html')
  await expect(page.locator('#created')).toHaveText('3')
  const initial = await page.locator('canvas').screenshot()
  await page.getByRole('button', { name: 'Toggle vessel' }).click()
  await expect(page.locator('#disposed')).toHaveText('3')
  const empty = await page.locator('canvas').screenshot()
  expect(empty.equals(initial)).toBe(false)
  await page.getByRole('button', { name: 'Toggle vessel' }).click()
  await expect(page.locator('#created')).toHaveText('6')
  await expect(page.locator('#disposed')).toHaveText('3')
  expect((await page.locator('canvas').screenshot()).equals(empty)).toBe(false)
  await page.getByRole('button', { name: 'Toggle vessel' }).click()
  await expect(page.locator('#disposed')).toHaveText('6')
  expect(errors).toEqual([])
})
