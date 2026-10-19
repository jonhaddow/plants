import { fail } from '@sveltejs/kit';
import { today } from '#lib/dates.ts';
import { readPlantForm } from '#lib/server/plant-form.ts';
import { deletePhoto, photoFrom, savePhoto } from '#lib/server/photos.ts';
import { addPlant, deletePlant, rooms, setPhoto } from '#lib/server/plants.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => ({ rooms: await rooms(locals.db) });

// Called by the camera page with fetch, once per photo, so it never leaves the camera.
export const actions: Actions = {
	add: async ({ request, locals }) => {
		const form = await request.formData();
		const photo = photoFrom(form);
		if (photo === 'invalid') return fail(400, { error: 'That photo didn’t work; try another' });
		const input = await readPlantForm(locals.db, form);
		if ('error' in input) return fail(400, { error: input.error });
		const id = await addPlant(
			locals.db,
			{ ...input, wateredToday: form.get('wateredToday') === 'on' },
			today()
		);
		if (photo) await setPhoto(locals.db, id, await savePhoto(locals.db, photo));
		return { added: { id, name: input.name, roomId: input.roomId } };
	},
	// Undo, straight after adding one by mistake.
	remove: async ({ request, locals }) => {
		const id = Number((await request.formData()).get('id'));
		await deletePhoto(locals.db, await deletePlant(locals.db, id));
		return { removed: id };
	}
};
