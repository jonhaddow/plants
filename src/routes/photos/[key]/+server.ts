import { error } from '@sveltejs/kit';
import { getPhoto } from '#lib/server/photos.ts';
import type { RequestHandler } from './$types';

/** A plant photo, for signed-in people only. Keys never change content, so it's cached for good. */
export const GET: RequestHandler = async ({ params, locals }) => {
	const photo = await getPhoto(locals.db, params.key);
	if (!photo) error(404);
	return new Response(photo.bytes, {
		headers: {
			'content-type': photo.type,
			'cache-control': 'private, max-age=31536000, immutable'
		}
	});
};
