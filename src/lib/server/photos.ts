import { eq } from 'drizzle-orm';
import { photo } from './db/schema.ts';
import type { DB } from './db/index.ts';

/**
 * Phones shrink photos to about 200 KB before sending (src/lib/photo.ts).
 * This is the backstop: as base64 it must fit D1's 2 MB a value.
 */
const MAX_BYTES = 1_400_000;

/** The photo from a form, if one was picked and it's a sensible image. */
export function photoFrom(form: FormData): File | 'invalid' | null {
	const file = form.get('photo');
	if (!(file instanceof File) || file.size === 0) return null;
	if (!file.type.startsWith('image/') || file.size > MAX_BYTES) return 'invalid';
	return file;
}

// Native base64 on Uint8Array takes microseconds. Decoding a photo by hand took
// ~50 ms of CPU, past the Workers free plan's ~10 ms, so photos failed to load.
// (Node 24 lacks these; tests and the dev server get them from src/node-shims.ts.)

/** Stores a photo; each gets a new key, so it can be cached for good. */
export async function savePhoto(db: DB, file: File) {
	const key = crypto.randomUUID();
	const data = new Uint8Array(await file.arrayBuffer()).toBase64();
	await db.insert(photo).values({ key, type: file.type, data });
	return key;
}

export async function getPhoto(db: DB, key: string) {
	const [row] = await db.select().from(photo).where(eq(photo.key, key));
	if (!row) return null;
	return { type: row.type, bytes: Uint8Array.fromBase64(row.data) };
}

export async function deletePhoto(db: DB, key: string | null) {
	if (key) await db.delete(photo).where(eq(photo.key, key));
}
