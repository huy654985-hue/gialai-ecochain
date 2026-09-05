import { expect, test } from '@playwright/test'

test('homepage loads with brand + live header', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('GIALAI', { exact: true }).first()).toBeVisible()
  await expect(page.getByLabel('Thông báo')).toBeVisible()
})

test('notifications page lists alerts from local backend', async ({ page }) => {
  await page.goto('/notifications')
  await expect(page.getByRole('heading', { name: /Thông báo/i })).toBeVisible()
})

test('community feed renders composer + gallery', async ({ page }) => {
  await page.goto('/community')
  await expect(page.getByPlaceholder(/hiện trường/i)).toBeVisible()
  await expect(page.getByText(/Ảnh hiện trường tham khảo/i)).toBeVisible()
})

test('admin shows live service config board', async ({ page }) => {
  await page.goto('/admin')
  await expect(page.getByText(/Tình trạng cấu hình/i)).toBeVisible()
  await expect(page.getByText(/NASA FIRMS/i).first()).toBeVisible({ timeout: 30000 })
})
