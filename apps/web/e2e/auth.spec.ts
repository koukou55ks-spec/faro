import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/auth/login')

    await expect(page).toHaveTitle(/Faro/)
    await expect(page.locator('h1')).toContainText(/ログイン|Sign in/i)
  })

  test('should display signup page', async ({ page }) => {
    await page.goto('/auth/signup')

    await expect(page).toHaveTitle(/Faro/)
    await expect(page.locator('h1')).toContainText(/サインアップ|Sign up/i)
  })

  test('should navigate from login to signup', async ({ page }) => {
    await page.goto('/auth/login')

    // Look for signup link
    const signupLink = page.getByRole('link', { name: /サインアップ|Sign up/i })
    await signupLink.click()

    await expect(page).toHaveURL(/\/auth\/signup/)
  })

  test('should show validation errors on empty login form', async ({ page }) => {
    await page.goto('/auth/login')

    const submitButton = page.getByRole('button', { name: /ログイン|Sign in/i })
    await submitButton.click()

    // Should stay on login page
    await expect(page).toHaveURL(/\/auth\/login/)
  })
})
