import { eq } from 'drizzle-orm';
import { photo } from './db/schema.ts';
import type { DB } from './db/index.ts';

/**
 * Phones shrink photos to about 200 KB before sending (PhotoInput.svelte).
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

// Workers have native base64 on Uint8Array, which takes microseconds. Decoding a
// photo by hand took ~50 ms of CPU, past the free plan's ~10 ms, so photos failed
// to load. The fallbacks are for the unit tests: Node 24 doesn't have them yet.
type Base64 = {
	fromBase64?(s: string): Uint8Array<ArrayBuffer>;
	prototype: { toBase64?(this: Uint8Array): string };
};
const native = Uint8Array as unknown as Base64;

function toBase64(bytes: Uint8Array) {
	if (native.prototype.toBase64) return native.prototype.toBase64.call(bytes);
	let binary = '';
	for (let i = 0; i < bytes.length; i += 0x8000)
		binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
	return btoa(binary);
}

const fromBase64 = (data: string) =>
	native.fromBase64?.(data) ?? Uint8Array.from(atob(data), (c) => c.charCodeAt(0));

/** Stores a photo; each gets a new key, so it can be cached for good. */
export async function savePhoto(db: DB, file: File) {
	const key = crypto.randomUUID();
	const data = toBase64(new Uint8Array(await file.arrayBuffer()));
	await db.insert(photo).values({ key, type: file.type, data });
	return key;
}

export async function getPhoto(db: DB, key: string) {
	const [row] = await db.select().from(photo).where(eq(photo.key, key));
	if (!row) return null;
	return { type: row.type, bytes: fromBase64(row.data) };
}

export async function deletePhoto(db: DB, key: string | null) {
	if (key) await db.delete(photo).where(eq(photo.key, key));
}
