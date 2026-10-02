import { expect, test } from '@playwright/test'

test('renders bundled foliage and responds to camera and touch interaction', async ({ page, context }, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.route('https://fonts.googleapis.com/**', (route) => route.fulfill({ body: '', contentType: 'text/css' }))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#pflanze/bergpalme')
  const canvas = page.locator('canvas')
  await expect(canvas).toBeVisible()
  await expect(page.locator('.stage__loading')).toHaveCount(0)

  // Check actual rendered pixels, not just a mounted canvas. Background, pot and
  // text cannot satisfy this green-foliage threshold on their own.
  await expect.poll(async () => {
    const png = await canvas.screenshot()
    return page.evaluate(async (base64) => {
      const image = new Image()
      image.src = `data:image/png;base64,${base64}`
      await image.decode()
      const surface = document.createElement('canvas')
      surface.width = image.width
      surface.height = image.height
      const ctx = surface.getContext('2d')!
      ctx.drawImage(image, 0, 0)
      const pixels = ctx.getImageData(0, 0, surface.width, surface.height).data
      let green = 0
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 1] > pixels[i] + 15 && pixels[i + 1] > pixels[i + 2] + 15) green++
      }
      return green
    }, png.toString('base64'))
  }).toBeGreaterThan(300)

  const box = (await canvas.boundingBox())!
  // Sample only the specimen area: button hover states and footer glyphs must
  // not make a broken camera interaction look like a successful render change.
  const specimenImage = () => page.screenshot({ clip: {
    x: box.x + box.width * 0.25, y: box.y + box.height * 0.35,
    width: box.width * 0.5, height: box.height * 0.3,
  } })
  const before = await specimenImage()
  if (testInfo.project.name === 'mobile') {
    const session = await context.newCDPSession(page)
    const y = box.y + box.height * 0.55
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: box.x + box.width * 0.3, y }] })
    for (let step = 1; step <= 6; step++) {
      await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: box.x + box.width * (0.3 + step * 0.06), y }] })
    }
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await session.detach()
  } else {
    await page.getByRole('button', { name: 'Zoom in', exact: true }).click()
  }
  await expect.poll(async () => (await specimenImage()).equals(before)).toBe(false)
  await page.getByRole('radio', { name: 'Roots', exact: true }).click()
  await expect(page.locator('.ruler-note').filter({ hasText: 'Root depth' })).toBeVisible()
  await page.getByRole('button', { name: 'Compare', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Plants compared' })).toBeVisible()
  expect(errors).toEqual([])
})
