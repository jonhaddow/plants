// Photos are shrunk on the phone before upload, so sending one is quick and
// the database stays small (see photos.ts on the server).
const MAX_SIDE = 1200;

/** A picture (a photo, or a frame of the camera) as a JPEG of at most 1200px a side. */
export async function toJpeg(source: CanvasImageSource, width: number, height: number) {
	const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
	const canvas = document.createElement('canvas');
	canvas.width = Math.round(width * scale);
	canvas.height = Math.round(height * scale);
	canvas.getContext('2d')!.drawImage(source, 0, 0, canvas.width, canvas.height);
	return new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.82));
}

/** A picked photo file shrunk, or the original if this browser can't. */
export async function shrinkFile(file: File): Promise<Blob> {
	try {
		const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
		return (await toJpeg(bitmap, bitmap.width, bitmap.height)) ?? file;
	} catch {
		return file;
	}
}
