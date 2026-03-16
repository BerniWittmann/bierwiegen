import { test, expect } from '@playwright/test'

test.describe('Setup tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Clear localStorage to start fresh
    await page.evaluate(() => localStorage.removeItem('bwv3'))
    await page.reload()
  })

  test('shows the app title and navigation', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Bierwiegen/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Setup/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Runde/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Tabelle/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Rangliste/i })).toBeVisible()
  })

  test('shows empty player list initially', async ({ page }) => {
    await expect(page.getByText('Noch keine Spieler')).toBeVisible()
  })

  test('can add a player', async ({ page }) => {
    await page.fill('input[placeholder="Name..."]', 'Alice')
    await page.fill('input[placeholder="g"]', '500')
    await page.getByRole('button', { name: '+' }).click()

    await expect(page.getByText('Alice')).toBeVisible()
    await expect(page.getByText('500g')).toBeVisible()
  })

  test('can add player with Enter key', async ({ page }) => {
    await page.fill('input[placeholder="Name..."]', 'Bob')
    await page.fill('input[placeholder="g"]', '450')
    await page.locator('input[placeholder="g"]').press('Enter')

    await expect(page.getByText('Bob')).toBeVisible()
  })

  test('can remove a player', async ({ page }) => {
    await page.fill('input[placeholder="Name..."]', 'Alice')
    await page.fill('input[placeholder="g"]', '500')
    await page.getByRole('button', { name: '+' }).click()

    await page.getByRole('button', { name: '✕' }).click()

    await expect(page.getByText('Noch keine Spieler')).toBeVisible()
  })

  test('cannot start game with fewer than 2 players', async ({ page }) => {
    await page.fill('input[placeholder="Name..."]', 'Alice')
    await page.fill('input[placeholder="g"]', '500')
    await page.getByRole('button', { name: '+' }).click()

    await page.getByRole('button', { name: /Spiel starten/i }).click()

    await expect(page.getByText('Mindestens 2 Spieler!')).toBeVisible()
  })

  test('cannot start game if a player has no start weight', async ({ page }) => {
    await page.fill('input[placeholder="Name..."]', 'Alice')
    await page.locator('input[placeholder="Name..."]').press('Enter')

    await page.fill('input[placeholder="Name..."]', 'Bob')
    await page.fill('input[placeholder="g"]', '450')
    await page.getByRole('button', { name: '+' }).click()

    await page.getByRole('button', { name: /Spiel starten/i }).click()

    await expect(page.getByText(/Startgewicht fehlt/i)).toBeVisible()
  })

  test('starts game and switches to Runde tab', async ({ page }) => {
    await page.fill('input[placeholder="Name..."]', 'Alice')
    await page.fill('input[placeholder="g"]', '500')
    await page.getByRole('button', { name: '+' }).click()

    await page.fill('input[placeholder="Name..."]', 'Bob')
    await page.fill('input[placeholder="g"]', '480')
    await page.getByRole('button', { name: '+' }).click()

    await page.getByRole('button', { name: /Spiel starten/i }).click()

    // Should switch to Runde tab
    await expect(page.getByText('Runde')).toBeVisible()
    await expect(page.locator('.font-bebas').filter({ hasText: '1' }).first()).toBeVisible()
  })

  test('reset clears all players and rounds', async ({ page }) => {
    await page.fill('input[placeholder="Name..."]', 'Alice')
    await page.fill('input[placeholder="g"]', '500')
    await page.getByRole('button', { name: '+' }).click()

    // Accept confirm dialog
    page.on('dialog', (dialog) => dialog.accept())
    await page.getByRole('button', { name: /Zurücksetzen/i }).click()

    await expect(page.getByText('Noch keine Spieler')).toBeVisible()
  })
})
