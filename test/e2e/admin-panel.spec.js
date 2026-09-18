const path = require('path')
const { sharedHelper } = require(path.join(
  process.env.AURORA_E2E_ROOT,
  'helpers/paths'
))
const { test, expect } = require('@playwright/test')
const { T } = sharedHelper('timeouts')
const { step, attachScreenshot } = sharedHelper('login')
const {
  hasAdminCredentials,
  getAdminCredentials,
} = sharedHelper('credentials')

function adminPanelUrl(baseURL) {
  const base = (baseURL || 'http://localhost:8888/').replace(/\/?$/, '/')
  return new URL('adminpanel/', base).toString()
}

function loginName(page) {
  return page
    .getByTestId('admin-login-name')
    .or(page.locator('.login-name').first())
    .first()
}

function loginPassword(page) {
  return page
    .getByTestId('admin-login-password')
    .or(page.locator('.login-password').first())
    .first()
}

function loginSubmit(page) {
  return page
    .getByTestId('admin-login-submit')
    .or(page.locator('button.bg-primary').first())
    .first()
}

function adminShell(page) {
  return page
    .getByTestId('admin-shell')
    .or(page.locator('.q-header').first())
    .first()
}

async function fillQuasarInput(control, value) {
  const input = control.locator('input').first()
  if ((await input.count()) > 0) {
    await input.fill(value)
    return
  }
  await control.fill(value)
}

test.describe('Admin panel (Vue)', () => {
  test('shows login form and signs in when admin credentials are set', async ({
    page,
    baseURL,
  }) => {
    test.setTimeout(T(120000))

    await step('Open admin panel', async () => {
      await page.context().clearCookies()
      await page.goto(adminPanelUrl(baseURL), {
        waitUntil: 'domcontentloaded',
        timeout: T(60000),
      })
      await expect(loginName(page)).toBeVisible({ timeout: T(30000) })
      await expect(loginPassword(page)).toBeVisible({ timeout: T(15000) })
      await expect(loginSubmit(page)).toBeVisible({ timeout: T(15000) })
      await attachScreenshot(page, 'admin-panel-01-login')
    })

    test.skip(
      !hasAdminCredentials(),
      'Set E2E_LOGIN_ADMIN and E2E_PASSWORD_ADMIN in .env.e2e for signed-in admin coverage'
    )

    const { login, password } = getAdminCredentials()

    await step('Sign in as superadmin', async () => {
      await fillQuasarInput(loginName(page), login)
      await fillQuasarInput(loginPassword(page), password)
      await loginSubmit(page).click()

      await expect(adminShell(page)).toBeVisible({ timeout: T(60000) })
      await expect(loginName(page)).toBeHidden({ timeout: T(15000) })

      const usersNav = page
        .getByTestId('admin-nav-users')
        .or(page.locator('.q-tab').filter({ hasText: /users|пользовател/i }))
      const systemNav = page
        .getByTestId('admin-nav-system')
        .or(page.locator('.q-tab').filter({ hasText: /system|систем/i }))

      const hasUsers = await usersNav.first().isVisible().catch(() => false)
      const hasSystem = await systemNav.first().isVisible().catch(() => false)
      expect(hasUsers || hasSystem).toBe(true)

      if (hasUsers) {
        await usersNav.first().click()
        await expect(
          page
            .getByTestId('admin-users-page')
            .or(page.locator('.q-splitter').first())
            .first()
        ).toBeVisible({ timeout: T(30000) })
      } else if (hasSystem) {
        await systemNav.first().click()
        await expect(
          page
            .getByTestId('admin-system-page')
            .or(page.locator('.q-splitter').first())
            .first()
        ).toBeVisible({ timeout: T(30000) })
      }

      await attachScreenshot(page, 'admin-panel-02-signed-in')
    })
  })
})
