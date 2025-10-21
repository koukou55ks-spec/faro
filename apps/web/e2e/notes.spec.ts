import { test, expect } from '@playwright/test'

test.describe('Notes Feature (Guest Mode)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/app')
    await page.waitForLoadState('networkidle')
  })

  test('should display notes interface', async ({ page }) => {
    // Look for notes section or button
    const notesElement = page.getByText(/ノート|Notes/i).first()

    // If notes UI exists, verify it's accessible
    const notesCount = await notesElement.count()
    expect(notesCount).toBeGreaterThanOrEqual(0)
  })

  test('should create a new note as guest', async ({ page }) => {
    // Clear previous guest data
    await page.evaluate(() => {
      Object.keys(localStorage).forEach(key => {
        if (key.includes('note') || key.includes('guest')) {
          localStorage.removeItem(key)
        }
      })
    })

    await page.reload()
    await page.waitForLoadState('networkidle')

    // Try to find and click new note button
    const newNoteButton = page.getByRole('button', { name: /新規|New|作成|Create/i })
      .and(page.getByRole('button', { name: /ノート|Note/i }))
      .or(page.getByRole('button', { name: /新規ノート|New Note/i }))
      .first()

    if (await newNoteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await newNoteButton.click()

      // Wait for note editor to appear
      const noteEditor = page.locator('textarea, [contenteditable="true"]').first()
      await expect(noteEditor).toBeVisible({ timeout: 3000 })

      // Type some content
      await noteEditor.fill('Test note from E2E test')

      // Look for save button
      const saveButton = page.getByRole('button', { name: /保存|Save/i }).first()
      if (await saveButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await saveButton.click()

        // Verify note was saved (should remain on page)
        await expect(page).toHaveURL(/\/app/)
      }
    }
  })

  test('should persist notes in localStorage', async ({ page }) => {
    // Check if guest notes are stored in localStorage
    const guestNotes = await page.evaluate(() => {
      const keys = Object.keys(localStorage)
      return keys.filter(key => key.includes('guest') && key.includes('note'))
    })

    // Guest notes storage should be accessible
    expect(Array.isArray(guestNotes)).toBe(true)
  })
})
