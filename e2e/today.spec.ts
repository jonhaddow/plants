import { expect, test } from '@playwright/test';
import { open } from './helpers.ts';

test('shows what needs water, room by room', async ({ page }) => {
	await open(page, '/');
	await expect(page.getByText('3 plants need water')).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Living room' })).toBeVisible();
	await expect(page.getByText('2 days late')).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Coming up' })).toBeVisible();
	await expect(page.getByRole('link', { name: /Cactus/ })).toContainText('In 3 days');
});

test('watering takes a plant off the list, and Undo puts it back', async ({ page }) => {
	await open(page, '/');
	await page.getByRole('button', { name: 'Watered Fern' }).click();
	await expect(page.getByRole('status')).toContainText('Watered Fern');
	await expect(page.getByRole('button', { name: 'Watered Fern' })).toBeHidden();
	await expect(page.getByText('2 plants need water')).toBeVisible();

	await page.getByRole('button', { name: 'Undo' }).click();
	await expect(page.getByRole('button', { name: 'Watered Fern' })).toBeVisible();
	await expect(page.getByText('3 plants need water')).toBeVisible();
});

test('still damp puts it off for a few days', async ({ page }) => {
	await open(page, '/');
	await page.getByRole('button', { name: 'Basil is still damp' }).click();
	await expect(page.getByRole('status')).toContainText('Basil: looking again soon');
	await expect(page.getByRole('link', { name: /Basil/ })).toContainText('Tomorrow');
	await page.getByRole('button', { name: 'Undo' }).click();
	await expect(page.getByRole('button', { name: 'Basil is still damp' })).toBeVisible();
});
