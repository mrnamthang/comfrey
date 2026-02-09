import { test, expect } from '@playwright/test';

test('dashboard loads and shows New Design button', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Comfrey' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'New Design' })).toBeVisible();
});
