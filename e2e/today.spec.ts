import { expect, test } from '@playwright/test';
import { open } from './helpers.ts';

test('shows what needs water as photo tiles, filtered by room', async ({ page }) => {
	await open(page, '/');
	await expect(page.getByText('3 plants need water')).toBeVisible();
	await expect(page.getByText('2d late')).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Coming up' })).toBeVisible();
	// Coming up is a row per day; open one to see its plants.
	await expect(page.getByRole('link', { name: /Cactus/ })).toBeHidden();
	const day = page.locator('summary', { hasText: '1 plant' });
	await expect(day).toContainText(/[A-Z][a-z]{2} \d{1,2} [A-Z][a-z]{2}/);
	await day.click();
	await expect(page.getByRole('link', { name: /Cactus/ })).toBeVisible();

	await page.getByRole('button', { name: 'Kitchen', exact: true }).click();
	await expect(page.getByRole('button', { name: 'Watered Basil' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Watered Fern' })).toBeHidden();
	await page.getByRole('button', { name: 'All', exact: true }).click();
	await expect(page.getByRole('button', { name: 'Watered Fern' })).toBeVisible();
});

test('tapping a tile waters it, and tapping again undoes it', async ({ page }) => {
	await open(page, '/');
	await page.getByRole('button', { name: 'Watered Fern' }).click();
	await expect(page.getByRole('status')).toContainText('Watered Fern');
	await expect(page.getByText('2 plants need water')).toBeVisible();

	await page.getByRole('button', { name: 'Undo watering Fern' }).click();
	await expect(page.getByRole('button', { name: 'Watered Fern' })).toBeVisible();
	await expect(page.getByText('3 plants need water')).toBeVisible();
});

test('still damp puts it off for a few days, and Undo puts it back', async ({ page }) => {
	await open(page, '/');
	await page.getByRole('button', { name: 'Basil is still damp' }).click();
	await expect(page.getByRole('status')).toContainText('Basil: looking again soon');
	await expect(page.getByRole('button', { name: 'Undo Basil still damp' })).toBeVisible();
	await page.getByRole('status').getByRole('button', { name: 'Undo' }).click();
	await expect(page.getByRole('button', { name: 'Basil is still damp' })).toBeVisible();
});
