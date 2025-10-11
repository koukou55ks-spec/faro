import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('should display landing page', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/Faro/)
  })

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/')

    // Check for login link
    const loginLink = page.getByRole('link', { name: /ログイン|Login/i }).first()
    await expect(loginLink).toBeVisible()
  })

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/')

    const loginLink = page.getByRole('link', { name: /ログイン|Login/i }).first()
    await loginLink.click()

    await expect(page).toHaveURL(/\/auth\/login/)
  })
})
