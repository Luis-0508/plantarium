import { expect, test } from '@playwright/test'

test('renders bundled foliage and responds to camera and touch interaction', async ({ page, context }, testInfo) => {
  test.setTimeout(120_000)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.route('https://fonts.googleapis.com/**', (route) => route.fulfill({ body: '', contentType: 'text/css' }))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#pflanze/bergpalme')
  const canvas = page.locator('canvas')
  await expect(canvas).toBeVisible()
  await expect(page.locator('.stage__loading')).toHaveCount(0)
  // Exclude overlay controls and keep image transfer small on software GPUs.
  const specimenImage = async () => {
    // R3F resizes the initial 300 x 150 canvas after it becomes visible.
    const box = (await canvas.boundingBox())!
    return page.screenshot({ clip: {
      x: box.x + box.width * 0.25, y: box.y + box.height * 0.35,
      width: box.width * 0.5, height: box.height * 0.3,
    } })
  }

  // Check actual rendered pixels, not just a mounted canvas. Background, pot and
  // text cannot satisfy this green-foliage threshold on their own.
  await expect.poll(async () => {
    const png = await specimenImage()
    return page.evaluate(async (base64) => {
      const image = new Image()
      image.src = `data:image/png;base64,${base64}`
      await image.decode()
      const surface = document.createElement('canvas')
      surface.width = 128
      surface.height = 128
      const ctx = surface.getContext('2d')!
      ctx.drawImage(image, 0, 0, surface.width, surface.height)
      const pixels = ctx.getImageData(0, 0, surface.width, surface.height).data
      let green = 0
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 1] > pixels[i] + 15 && pixels[i + 1] > pixels[i + 2] + 15) green++
      }
      return green
    }, png.toString('base64'))
  }, { timeout: 60_000 }).toBeGreaterThan(30)

  const before = await specimenImage()
  if (testInfo.project.name === 'mobile') {
    const box = (await canvas.boundingBox())!
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
