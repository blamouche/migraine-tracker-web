import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('homepage loads and has heading', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Migraine AI' })).toBeVisible()
})

test('homepage has no a11y violations', async ({ page }) => {
  await page.goto('/')
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})
