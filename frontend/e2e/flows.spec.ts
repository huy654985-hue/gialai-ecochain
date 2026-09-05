import { expect, test } from '@playwright/test'

test('bug report flow returns a receipt id', async ({ page }) => {
  await page.goto('/reports')
  await page.getByLabel('Mô tả lỗi').fill('E2E: nut mau khong phan hoi khi bam')
  await page.getByRole('button', { name: 'Gửi báo lỗi' }).click()
  await expect(page.getByText(/Đã nhận báo lỗi #\d+/)).toBeVisible()
})

test('community vote requires no login and updates badge', async ({ page, request }) => {
  const API = 'http://localhost:8000'
  const areas = await (await request.get(`${API}/api/forest/areas`)).json()
  const unit = areas.find((a: any) => a.level === 'COMMUNE') ?? areas[0]
  // unique period per run — monitor caches per unit+period and returns existing
  const day = String(1 + (Date.now() % 27)).padStart(2, '0')
  const mon = await request.post(`${API}/api/agents/forest-guard/monitor`, { data: {
    administrative_unit_id: unit.id, start_date: '2026-08-01', end_date: `2026-09-${day}`,
    geometry: unit.geometry, dataset: 'SENTINEL2', cloud_percentage: 20,
  }})
  if(!mon.ok()) throw new Error(`monitor failed: ${mon.status()} ${await mon.text()}`)
  await page.goto('/community')
  await page.getByLabel('Biệt danh').fill(`e2e-${Date.now()}`)
  await page.getByRole('button', { name: 'Tất cả' }).click()
  await page.getByRole('button', { name: /Xác nhận/ }).first().click()
  await page.getByRole('button', { name: /Chi tiết/ }).first().click()
  await expect(page.getByRole('button', { name: /Xác nhận \(1\)/ }).first()).toBeVisible()
})
