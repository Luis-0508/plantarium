import { expect, test } from '@playwright/test'

test('recovers from a failed GLTF after a URL change on the same plant', async ({ page }) => {
  test.skip(test.info().project.name !== 'desktop', 'Model error lifecycle is viewport independent')
  await page.route('**/fixture/missing.gltf', (route) => route.fulfill({ status: 404, body: 'Missing test model' }))
  await page.route('**/fixture/missing-roots.gltf', (route) => route.fulfill({ status: 404, body: 'Missing test roots' }))
  const buffer = Buffer.from(new Float32Array([0, 0, 0, 0.1, 0, 0, 0, 0.1, 0]).buffer).toString('base64')
  await page.route('**/fixture/valid.gltf', (route) => route.fulfill({ contentType: 'model/gltf+json', body: JSON.stringify({
    asset: { version: '2.0' }, scene: 0, scenes: [{ nodes: [0] }], nodes: [{ name: 'leaf_fixture', mesh: 0 }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 } }] }],
    buffers: [{ uri: `data:application/octet-stream;base64,${buffer}`, byteLength: 36 }],
    bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: 36 }],
    accessors: [{ bufferView: 0, componentType: 5126, count: 3, type: 'VEC3', min: [0, 0, 0], max: [0.1, 0.1, 0] }],
  }) }))
  const failedShoot = page.waitForEvent('console', { predicate: (message) => message.text().includes('Plant model /fixture/missing.gltf could not be loaded') })
  await page.goto('/tests/browser/fixtures/models.html')
  await failedShoot
  await expect(page.locator('#model-status')).toHaveText('fallback')
  await page.getByRole('button', { name: 'Load working model' }).click()
  await expect(page.locator('#model-status')).toHaveText('loaded')
  const failedRoots = page.waitForEvent('console', { predicate: (message) => message.text().includes('Plant model /fixture/valid.gltf could not be loaded') })
  await page.getByRole('button', { name: 'Load broken roots' }).click()
  await failedRoots
  await expect(page.locator('#model-status')).toHaveText('fallback')
  await page.getByRole('button', { name: 'Load working model' }).click()
  await expect(page.locator('#model-status')).toHaveText('loaded')
})

test('contains a render exception in the stage boundary', async ({ page }) => {
  test.skip(test.info().project.name !== 'desktop', 'Error boundary is viewport independent')
  await page.goto('/tests/browser/fixtures/models.html?throw')
  await expect(page.getByText('The 3D view could not be loaded.', { exact: false })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Load working model' })).toBeVisible()
})
