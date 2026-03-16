import { test, expect } from '@playwright/test'

// Helper: start a game with 2 players
async function startGame(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.evaluate(() => localStorage.removeItem('bwv3'))
  await page.reload()

  await page.fill('input[placeholder="Name..."]', 'Alice')
  await page.fill('input[placeholder="g"]', '500')
  await page.getByRole('button', { name: '+' }).click()

  await page.fill('input[placeholder="Name..."]', 'Bob')
  await page.fill('input[placeholder="g"]', '480')
  await page.getByRole('button', { name: '+' }).click()

  await page.getByRole('button', { name: /Spiel starten/i }).click()
}

test.describe('Runde tab', () => {
  test('shows round 1 after game start with par 500', async ({ page }) => {
    await startGame(page)

    await expect(page.getByText('Par')).toBeVisible()
    await expect(page.getByText('500g')).toBeVisible()
    await expect(page.getByText('Alice')).toBeVisible()
    await expect(page.getByText('Bob')).toBeVisible()
  })

  test('shows remaining beer for each player', async ({ page }) => {
    await startGame(page)
    await expect(page.getByText('500g übrig')).toBeVisible()
    await expect(page.getByText('480g übrig')).toBeVisible()
  })

  test('shows target hint when par is set', async ({ page }) => {
    await startGame(page)
    // Par is 500, Alice has 500g, Bob has 480g
    // Target hint for Alice: drink until 0g (500-500=0), can't reach par
    // Target hint for Bob: drink until -20g (480-500=-20), can't reach par
    // Actually since rem < par for both, they show warning hints
    await expect(page.getByText(/Bier reicht nicht/i).first()).toBeVisible()
  })

  test('calculates drunk and delta when weight entered', async ({ page }) => {
    await startGame(page)

    // Enter end weight for Alice: 200g
    const weightInputs = page.locator('input[type="number"]:not([readonly])')
    await weightInputs.first().fill('200')

    // Delta should be |200 - 500| = 300
    await expect(page.getByText('|300|g')).toBeVisible()
    // Drunk should be 500 - 200 = 300
    const drunkInput = page.locator('input[readonly]').first()
    await expect(drunkInput).toHaveValue('300')
  })

  test('cannot finish round without all weights entered', async ({ page }) => {
    await startGame(page)
    await page.getByRole('button', { name: /Runde abschließen/i }).click()
    await expect(page.getByText(/Fehlt noch/i)).toBeVisible()
  })

  test('can complete a round and advance to round 2', async ({ page }) => {
    await startGame(page)

    // Enter weights for Alice and Bob
    const weightInputs = page.locator('input[type="number"]:not([readonly]):not(:disabled)')
    await weightInputs.nth(0).fill('200')
    await weightInputs.nth(1).fill('180')

    await page.getByRole('button', { name: /Runde abschließen/i }).click()

    // Should now be on round 2 with a par setter
    await expect(page.getByText(/Par-Ansage/i)).toBeVisible()
    await expect(page.locator('.font-bebas').filter({ hasText: '2' }).first()).toBeVisible()
  })

  test('shows par setter for round 2 caller', async ({ page }) => {
    await startGame(page)

    // Alice delta = |200-500|=300, Bob delta = |180-500|=320
    // Alice wins (smaller delta), so Alice announces next par
    const weightInputs = page.locator('input[type="number"]:not([readonly]):not(:disabled)')
    await weightInputs.nth(0).fill('200')
    await weightInputs.nth(1).fill('180')
    await page.getByRole('button', { name: /Runde abschließen/i }).click()

    // Alice has smaller delta (300 vs 320), so Alice should be the caller
    await expect(page.getByText('Alice')).toBeVisible()
  })

  test('can set par for round 2 and continue', async ({ page }) => {
    await startGame(page)

    const weightInputs = page.locator('input[type="number"]:not([readonly]):not(:disabled)')
    await weightInputs.nth(0).fill('200')
    await weightInputs.nth(1).fill('180')
    await page.getByRole('button', { name: /Runde abschließen/i }).click()

    // Set par for round 2
    await page.fill('input[placeholder="Par in g..."]', '150')
    await page.getByRole('button', { name: /Setzen/i }).click()

    await expect(page.getByText('150g')).toBeVisible()
  })

  test('end game early shows game over screen', async ({ page }) => {
    await startGame(page)

    page.on('dialog', (dialog) => dialog.accept())
    await page.getByRole('button', { name: /Spiel beenden/i }).click()

    await expect(page.getByText('Rangliste')).toBeVisible()
  })
})

test.describe('Tabelle tab', () => {
  test('shows "no rounds" when game has not started', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.removeItem('bwv3'))
    await page.reload()

    await page.getByRole('button', { name: /Tabelle/i }).click()
    await expect(page.getByText('Noch keine Runden')).toBeVisible()
  })

  test('shows scorecard after a completed round', async ({ page }) => {
    await startGame(page)

    const weightInputs = page.locator('input[type="number"]:not([readonly]):not(:disabled)')
    await weightInputs.nth(0).fill('200')
    await weightInputs.nth(1).fill('180')
    await page.getByRole('button', { name: /Runde abschließen/i }).click()

    await page.getByRole('button', { name: /Tabelle/i }).click()

    await expect(page.getByText('R1')).toBeVisible()
    await expect(page.getByText('500g')).toBeVisible() // par row
    await expect(page.getByText('Alice')).toBeVisible()
    await expect(page.getByText('Bob')).toBeVisible()
  })

  test('scorecard shows medal icons for top 3', async ({ page }) => {
    await startGame(page)

    const weightInputs = page.locator('input[type="number"]:not([readonly]):not(:disabled)')
    await weightInputs.nth(0).fill('200')
    await weightInputs.nth(1).fill('180')
    await page.getByRole('button', { name: /Runde abschließen/i }).click()

    await page.getByRole('button', { name: /Tabelle/i }).click()

    // Should show medals
    await expect(page.getByText('🥇')).toBeVisible()
  })
})

test.describe('Rangliste tab', () => {
  test('shows "no rounds" when game has not started', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.removeItem('bwv3'))
    await page.reload()

    await page.getByRole('button', { name: /Rangliste/i }).click()
    await expect(page.getByText('Noch keine Runden gespielt')).toBeVisible()
  })

  test('shows leaderboard after a completed round', async ({ page }) => {
    await startGame(page)

    const weightInputs = page.locator('input[type="number"]:not([readonly]):not(:disabled)')
    await weightInputs.nth(0).fill('200')
    await weightInputs.nth(1).fill('180')
    await page.getByRole('button', { name: /Runde abschließen/i }).click()

    await page.getByRole('button', { name: /Rangliste/i }).click()

    await expect(page.getByText('Alice')).toBeVisible()
    await expect(page.getByText('Bob')).toBeVisible()
    await expect(page.getByText('1 Runden')).toBeVisible()
  })

  test('shows winner highlighted in leaderboard', async ({ page }) => {
    await startGame(page)

    // Alice: |200-500| = 300, Bob: |180-500| = 320 → Alice wins
    const weightInputs = page.locator('input[type="number"]:not([readonly]):not(:disabled)')
    await weightInputs.nth(0).fill('200')
    await weightInputs.nth(1).fill('180')
    await page.getByRole('button', { name: /Runde abschließen/i }).click()

    await page.getByRole('button', { name: /Rangliste/i }).click()

    // First place should show the winner icon
    await expect(page.getByText('🥇')).toBeVisible()
  })
})

test.describe('localStorage persistence', () => {
  test('persists players across page reloads', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.removeItem('bwv3'))
    await page.reload()

    await page.fill('input[placeholder="Name..."]', 'Alice')
    await page.fill('input[placeholder="g"]', '500')
    await page.getByRole('button', { name: '+' }).click()

    await page.reload()

    await expect(page.getByText('Alice')).toBeVisible()
    await expect(page.getByText('500g')).toBeVisible()
  })

  test('persists game state across page reloads', async ({ page }) => {
    await startGame(page)

    const weightInputs = page.locator('input[type="number"]:not([readonly]):not(:disabled)')
    await weightInputs.nth(0).fill('200')

    await page.reload()

    // Should still be on the Runde tab with round 1
    await page.getByRole('button', { name: /Runde/i }).click()
    await expect(page.getByText('500g')).toBeVisible() // par
  })
})
