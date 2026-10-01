import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.route('https://fonts.googleapis.com/**', (route) => route.fulfill({ body: '', contentType: 'text/css' }))
  await page.emulateMedia({ reducedMotion: 'reduce' })
})

test('keeps plant information usable after a chunk failure and can retry', async ({ page }) => {
  test.skip(test.info().project.name !== 'desktop', 'Chunk recovery is viewport independent')
  await page.route('**/src/three/Stage.tsx*', (route) => route.abort())
  await page.goto('/#pflanze/bergpalme')
  await expect(page.getByText('Die 3D-Ansicht konnte nicht geladen werden.', { exact: false })).toBeVisible()
  await page.getByRole('navigation', { name: 'Pflanze wählen' }).getByRole('button', { name: /Grünlilie/ }).click()
  await expect(page.getByRole('complementary', { name: 'Steckbrief Grünlilie' })).toBeAttached()
  await expect(page.locator('.stage')).toHaveAttribute('aria-busy', 'false')
  await page.unroute('**/src/three/Stage.tsx*')
  await page.getByRole('button', { name: 'Erneut laden' }).click()
  await expect(page.locator('canvas')).toBeVisible()
  await expect(page.locator('.stage__error')).toHaveCount(0)
  await expect(page).toHaveURL(/#pflanze\/gruenlilie$/)
})

test('handles unavailable WebGL without losing the information panel', async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', { value: function (type: string, ...args: unknown[]) {
      return type.startsWith('webgl') ? null : Reflect.apply(original, this, [type, ...args])
    } })
  })
  await page.goto('/#pflanze/bergpalme')
  await expect(page.locator('.stage__error')).toBeVisible()
  await expect(page.getByRole('complementary', { name: 'Steckbrief Bergpalme' })).toBeAttached()
  await page.screenshot({ path: testInfo.outputPath('stage-unavailable.png') })
})
