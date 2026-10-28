import { test, expect, Page } from '@playwright/test'

const ADMIN = { user: process.env.E2E_ADMIN_USER || 'admin', pass: process.env.E2E_ADMIN_PASS || 'Admin!Local123' }
// A plain tenant on a fresh trial with no Google key yet (seeded by tests/seed-e2e; see README).
const TENANT = { user: process.env.E2E_TENANT_USER || 'tenant1', pass: process.env.E2E_TENANT_PASS || 'Tenant!Pass123' }
const API = process.env.E2E_API_URL || 'http://localhost:5161'

async function login(page: Page, user = ADMIN.user, pass = ADMIN.pass) {
  await page.goto('/login')
  await page.getByLabel(/username or email/i).fill(user)
  await page.getByLabel(/^password/i).fill(pass)
  await page.getByRole('button', { name: /sign in|log in|login/i }).first().click()
  await page.waitForURL(/\/(dashboard|subscriptions)/, { timeout: 30_000 })
}

test.describe('tenant app smoke', () => {
  test('a new tenant lands on the dashboard with the setup checklist', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', e => errors.push(e.message))
    await login(page, TENANT.user, TENANT.pass)
    await expect(page.getByText('Getting started')).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText(/of 5 done/)).toBeVisible()
    expect(errors, 'no uncaught page errors').toEqual([])
  })

  test('header shows a fresh tenant as on trial, with usage in the tooltip', async ({ page }) => {
    await login(page, TENANT.user, TENANT.pass)
    const status = page.locator('.account-status')
    await expect(status).toBeVisible()
    await expect(status).toHaveText(/trial/i, { timeout: 15_000 })
    await expect(status).toHaveAttribute('title', /URLs left/)
  })

  test('google configuration verifies the service account per property', async ({ page }) => {
    await login(page)
    await page.goto('/settings/google-configuration')
    await page.getByRole('button', { name: /verify now/i }).click()
    await expect(page.getByText(/ready to index|Owner/i).first()).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText('http://localhost:5999/')).toBeVisible()
  })

  test('sites, crawl and billing pages render', async ({ page }) => {
    await login(page)
    await page.goto('/site-management')
    await expect(page.getByText('http://localhost:5999/').first()).toBeVisible({ timeout: 20_000 })
    await page.goto('/crawl-index-management')
    await expect(page.locator('table, .table, [role=table]').first()).toBeVisible({ timeout: 20_000 })
    await page.goto('/subscriptions')
    await expect(page.getByText(/Subscribe|Switch to this plan|Current plan/).first()).toBeVisible({ timeout: 20_000 })
  })

  test('crawl details explains Google status and shows a URL history', async ({ page }) => {
    await login(page)
    await page.goto('/crawl-index-details/1')
    await expect(page.getByRole('columnheader', { name: 'Google status' })).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('.google-status-cell').first()).toContainText(/Indexed|not indexed|Not on Google|noindex|Status/i)
    await page.getByRole('button', { name: 'Logs' }).first().click()
    await expect(page.getByText('URL history')).toBeVisible()
    await expect(page.locator('.timeline-list li').first()).toBeVisible({ timeout: 15_000 })
  })

  test('protected pages redirect to login when signed out', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForURL(/\/login/, { timeout: 20_000 })
    expect(page.url()).toContain('redirect=')
  })

  test('API refuses anonymous access to tenant data', async ({ request }) => {
    for (const path of ['/site?PageNumber=1&PageSize=5', '/crawl/site-list', '/menu', '/manage-users/entitlement']) {
      const res = await request.get(`${API}${path}`)
      expect(res.status(), path).toBe(401)
    }
  })
})
