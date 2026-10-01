import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.route('https://fonts.googleapis.com/**', (route) => route.fulfill({ body: '', contentType: 'text/css' }))
  await page.emulateMedia({ reducedMotion: 'reduce' })
})

test('synchronizes direct links, selection, history, hash edits and the wordmark', async ({ page }) => {
  test.setTimeout(90_000)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/#pflanze/bergpalme')
  await expect(page.locator('.stage')).toHaveAttribute('data-plant-id', 'bergpalme')
  await page.getByRole('navigation', { name: 'Pflanze wählen' }).getByRole('button', { name: /Grünlilie/ }).click()
  await expect(page).toHaveURL(/#pflanze\/gruenlilie$/)
  await expect(page.locator('.stage')).toHaveAttribute('data-plant-id', 'gruenlilie')
  await page.getByRole('button', { name: 'Vergleichen', exact: true }).click()
  await expect(page).toHaveURL(/#vergleich\/gruenlilie$/)
  await page.goBack()
  await expect(page.locator('.stage')).toHaveAttribute('data-plant-id', 'gruenlilie')
  await page.goBack()
  await expect(page.locator('.stage')).toHaveAttribute('data-plant-id', 'bergpalme')
  await page.goForward()
  await expect(page.locator('.stage')).toHaveAttribute('data-plant-id', 'gruenlilie')
  await page.evaluate(() => { window.location.hash = '#pflanze/goldfruchtpalme' })
  await expect(page.locator('.stage')).toHaveAttribute('data-plant-id', 'goldfruchtpalme')
  await page.getByRole('button', { name: 'Vergleichen', exact: true }).click()
  await page.getByRole('link', { name: 'Plantarium' }).click()
  await expect(page).toHaveURL(/#pflanze\/goldfruchtpalme$/)
  const historyLength = await page.evaluate(() => history.length)
  await page.getByRole('link', { name: 'Plantarium' }).click()
  expect(await page.evaluate(() => history.length)).toBe(historyLength)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Goldfruchtpalme', exact: true })).toBeVisible()
  await page.evaluate(() => { window.location.hash = '#pflanze/not-a-plant' })
  await expect(page).toHaveURL(/#pflanze\/gruenlilie$/)
  await expect(page.locator('.stage')).toHaveAttribute('data-plant-id', 'gruenlilie')
  expect(errors).toEqual([])
})

test('keeps every anatomy region reachable and honors reduced motion', async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    const original = Element.prototype.scrollTo
    Object.defineProperty(Element.prototype, 'scrollTo', { value: function (...args: unknown[]) {
      if (this.classList?.contains('panel__scroll')) this.dataset.scrollBehavior = (args[0] as ScrollToOptions)?.behavior ?? 'auto'
      return Reflect.apply(original, this, args)
    } })
  })
  await page.goto('/#pflanze/bergpalme')
  await page.keyboard.press('2')
  await expect(page.getByRole('radio', { name: 'Wurzeln', exact: true })).toBeChecked()
  await expect(page.getByText('Maße gelten für eine Pflanze im empfohlenen Topf.')).toBeVisible()
  await expect(page.locator('.ruler-note').filter({ hasText: 'Wurzeltiefe' })).toBeVisible()
  if (testInfo.project.name === 'desktop') await expect(page.locator('.panel__scroll')).toHaveAttribute('data-scroll-behavior', 'instant')
  await page.screenshot({ path: testInfo.outputPath('root-context.png') })
  const depthAnchor = page.locator('.anchor').filter({ hasText: 'Wurzeltiefe' })
  const initialTransform = await depthAnchor.evaluate((el) => (el as HTMLElement).style.transform)
  await page.getByRole('button', { name: 'Heranzoomen', exact: true }).click()
  await expect.poll(() => depthAnchor.evaluate((el) => (el as HTMLElement).style.transform)).not.toBe(initialTransform)
  await page.keyboard.press('3')
  await expect(page.getByRole('radio', { name: 'Anatomie', exact: true })).toBeChecked()
  await page.keyboard.press('2')
  // A view change resets framing; the previous zoom command must not replay.
  await expect.poll(() => depthAnchor.evaluate((el) => (el as HTMLElement).style.transform)).toBe(initialTransform)
  await page.keyboard.press('3')
  const selector = page.getByRole('combobox', { name: 'Pflanzenteil wählen' })
  const titles = ['Fiederwedel', 'Stämmchen', 'Blattscheiden', 'Substrat', 'Faserwurzeln']
  if (testInfo.project.name !== 'desktop') {
    await expect(selector).toBeVisible()
    expect((await selector.boundingBox())!.height).toBeGreaterThanOrEqual(44)
    await selector.focus()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Tab')
    await expect(page.locator('.anatomy__card h3')).toHaveText(titles[0])
    for (const title of titles) {
      await selector.selectOption({ label: title })
      await expect(page.locator('.anatomy__card h3')).toHaveText(title)
    }
  } else {
    for (const title of titles) {
      await page.locator('.anatomy__regions').getByRole('button', { name: title, exact: true }).click()
      await expect(page.locator('.anatomy__card h3')).toHaveText(title)
    }
  }
  await expect(page.locator('.anatomy__card')).toBeVisible()
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
  await page.screenshot({ path: testInfo.outputPath('anatomy-access.png'), animations: 'disabled' })
  await page.getByRole('button', { name: 'Erklärung schließen' }).click()
  await expect(page.locator('.anatomy__card')).toHaveCount(0)
  if (testInfo.project.name !== 'desktop') await expect(selector).toBeFocused()
  await page.getByRole('radio', { name: 'Anatomie', exact: true }).focus()
  await page.keyboard.press('ArrowLeft')
  await expect(page.getByRole('radio', { name: 'Wurzeln', exact: true })).toBeChecked()
  await page.keyboard.press('1')
  await expect(page.getByRole('radio', { name: 'Pflanze', exact: true })).toBeChecked()
})

test('commits visible plant information together during animated and rapid changes', async ({ page }) => {
  test.skip(test.info().project.name !== 'desktop', 'Animation state is viewport independent')
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/#pflanze/bergpalme')
  await expect(page.locator('canvas')).toBeVisible()
  await page.getByRole('radio', { name: 'Anatomie', exact: true }).click()
  await expect(page.locator('.hotspot').first()).toBeVisible()
  const frames = await page.evaluate(async () => {
    const samples: { id?: string; title?: string; panel: string | null; busy: string | null }[] = []
    const selector = document.querySelector('.selector')!
    ;(selector.querySelectorAll('button')[1] as HTMLButtonElement).click()
    return await new Promise<typeof samples>((resolve) => {
      const sample = () => {
        const stage = document.querySelector<HTMLElement>('.stage')!
        samples.push({ id: stage.dataset.plantId, title: document.querySelector('h1')?.textContent ?? '',
          panel: document.querySelector('.panel')!.getAttribute('aria-label'), busy: stage.getAttribute('aria-busy') })
        if (stage.dataset.plantId === 'goldfruchtpalme' && stage.getAttribute('aria-busy') === 'false') resolve(samples)
        else requestAnimationFrame(sample)
      }
      requestAnimationFrame(sample)
    })
  })
  expect(frames.some((f) => f.id === 'bergpalme' && f.busy === 'true')).toBe(true)
  for (const frame of frames) {
    const title = frame.id === 'bergpalme' ? 'Bergpalme' : 'Goldfruchtpalme'
    expect(frame.title).toBe(title)
    expect(frame.panel).toBe(`Steckbrief ${title}`)
  }
  await page.evaluate(() => {
    const buttons = document.querySelectorAll<HTMLButtonElement>('.selector button')
    buttons[0].click()
    setTimeout(() => buttons[2].click(), 30)
  })
  await expect(page.locator('.stage')).toHaveAttribute('data-plant-id', 'bergpalme')
  await expect(page.locator('.stage')).toHaveAttribute('aria-busy', 'false')
  await expect(page.locator('.anatomy__card')).toHaveCount(0)
})
