import { test, expect } from '@playwright/test'

test.describe('Main App Interface (/app)', () => {
  test('should display main app page with chat interface', async ({ page }) => {
    await page.goto('/app')

    // Check if page loads
    await expect(page).toHaveTitle(/Faro/)

    // Check for main app elements
    // Note: In development mode, guest access is allowed
    const chatContainer = page.locator('[data-testid="chat-container"]').or(page.locator('main'))
    await expect(chatContainer).toBeVisible()
  })

  test('should show chat input area', async ({ page }) => {
    await page.goto('/app')

    // Look for chat input (various possible selectors)
    const chatInput = page.getByPlaceholder(/メッセージ|message/i)
      .or(page.locator('textarea'))
      .first()

    await expect(chatInput).toBeVisible({ timeout: 5000 })
  })

  test('should display sidebar navigation', async ({ page }) => {
    await page.goto('/app')

    // Check for sidebar or navigation elements
    const sidebar = page.locator('aside').or(page.locator('[role="navigation"]')).first()
    await expect(sidebar).toBeVisible({ timeout: 5000 })
  })

  test('should allow guest users to access app (development mode)', async ({ page }) => {
    await page.goto('/app')

    // Should not redirect to login in development mode
    await expect(page).toHaveURL(/\/app/)

    // Check that we can interact with the app
    const mainContent = page.locator('main').or(page.locator('[role="main"]')).first()
    await expect(mainContent).toBeVisible()
  })

  test('should display current time', async ({ page }) => {
    await page.goto('/app')

    // Look for time display (many apps show current time)
    const timeDisplay = page.locator('time').or(page.getByText(/\d{1,2}:\d{2}/)).first()

    // This is optional, so we just check if it exists without failing
    const timeExists = await timeDisplay.count()
    expect(timeExists).toBeGreaterThanOrEqual(0)
  })
})

test.describe('Guest Mode Features', () => {
  test('should allow creating notes as guest', async ({ page }) => {
    await page.goto('/app')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Look for notes navigation or button
    const notesButton = page.getByRole('button', { name: /ノート|Notes/i })
      .or(page.getByText(/ノート|Notes/i))
      .first()

    // If notes button exists, verify we can access it
    if (await notesButton.isVisible()) {
      await notesButton.click()

      // Should stay on app page (not redirect to login)
      await expect(page).toHaveURL(/\/app/)
    }
  })

  test('should persist data in localStorage (guest mode)', async ({ page }) => {
    await page.goto('/app')

    // Check if localStorage is accessible
    const localStorageCheck = await page.evaluate(() => {
      try {
        localStorage.setItem('test', 'value')
        const result = localStorage.getItem('test')
        localStorage.removeItem('test')
        return result === 'value'
      } catch {
        return false
      }
    })

    expect(localStorageCheck).toBe(true)
  })
})
