import { describe, expect, it } from 'vitest';
import { testDb } from './test-db.ts';
import { deletePhoto, getPhoto, photoFrom, savePhoto } from './photos.ts';

describe('photos', () => {
	it('stores and returns the same bytes', async () => {
		const db = await testDb();
		// Bigger than one chunk of the base64 encoding.
		const bytes = Uint8Array.from({ length: 100_000 }, (_, i) => (i * 7919) % 256);
		const key = await savePhoto(db, new File([bytes], 'p.jpg', { type: 'image/jpeg' }));
		expect(await getPhoto(db, key)).toEqual({ type: 'image/jpeg', bytes });
		await deletePhoto(db, key);
		expect(await getPhoto(db, key)).toBeNull();
	});

	it('takes images only, and not huge ones', () => {
		const form = new FormData();
		expect(photoFrom(form)).toBeNull();
		form.set('photo', new File(['x'], 'notes.txt', { type: 'text/plain' }));
		expect(photoFrom(form)).toBe('invalid');
		form.set('photo', new File([new Uint8Array(2_000_000)], 'big.jpg', { type: 'image/jpeg' }));
		expect(photoFrom(form)).toBe('invalid');
		form.set('photo', new File(['x'], 'p.jpg', { type: 'image/jpeg' }));
		expect(photoFrom(form)).toBeInstanceOf(File);
	});
});
