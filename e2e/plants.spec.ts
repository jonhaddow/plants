import { expect, test } from '@playwright/test';
import { open } from './helpers.ts';

// A tiny green PNG, standing in for a phone photo.
const PNG = Buffer.from(
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
	'base64'
);

test('adds plants one after another, with a photo and a new room', async ({ page }) => {
	await open(page, '/plants/new');
	await page.locator('input[name=photo]').setInputFiles({
		name: 'plant.png',
		mimeType: 'image/png',
		buffer: PNG
	});
	await expect(page.getByRole('img', { name: 'The plant' })).toBeVisible();
	await page.getByText('New room').click();
	await page.getByLabel('New room name').fill('Hall');
	await page.getByText('Fortnightly').click();
	await page.getByRole('button', { name: 'Save plant' }).click();

	await expect(page.getByText('Added Hall plant 1. Next one?')).toBeVisible();
	// The room stays picked for the next one.
	await expect(page.getByRole('radio', { name: 'Hall' })).toBeChecked();
	await page.getByRole('textbox', { name: /^Name/ }).fill('Spider plant');
	await page.getByRole('button', { name: 'Save plant' }).click();
	await expect(page.getByText('Added Spider plant. Next one?')).toBeVisible();

	await open(page, '/plants');
	await expect(page.getByRole('heading', { name: 'Hall' })).toBeVisible();
	const first = page.getByRole('link', { name: /Hall plant 1/ });
	await expect(first).toContainText('Every 2 weeks');
	await expect(first.locator('img')).toHaveJSProperty('complete', true);
	expect(await first.locator('img').evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(1);
});

test('edits a plant and deletes it', async ({ page }) => {
	await open(page, '/plants');
	await page.getByRole('link', { name: /Aloe/ }).click();
	await page.getByRole('link', { name: 'Edit' }).click();
	await page.getByRole('textbox', { name: /^Name/ }).fill('Big aloe');
	await page.getByLabel('Water every (days)').fill('10');
	await page.getByLabel('What it is').fill('Aloe vera');
	await page.getByRole('button', { name: 'Save' }).click();

	await expect(page.getByRole('heading', { name: 'Big aloe' })).toBeVisible();
	await expect(page.getByText('Bedroom · Aloe vera')).toBeVisible();
	await expect(page.getByText(/Every 10 days/)).toBeVisible();

	await page.getByRole('button', { name: 'Delete plant' }).click();
	await page.getByRole('button', { name: 'Yes, delete Big aloe' }).click();
	await expect(page.getByRole('heading', { name: 'Plants' })).toBeVisible();
	await expect(page.getByRole('link', { name: /Big aloe/ })).toBeHidden();
});
