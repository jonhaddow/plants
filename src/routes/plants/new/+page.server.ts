import { fail, redirect } from '@sveltejs/kit';
import { today } from '#lib/dates.ts';
import { readPlantForm } from '#lib/server/plant-form.ts';
import { photoFrom, savePhoto } from '#lib/server/photos.ts';
import { addPlant, getPlant, rooms, setPhoto } from '#lib/server/plants.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const added = Number(url.searchParams.get('added'));
	const last = added ? await getPlant(locals.db, added) : null;
	// Adding several in a row: the room stays picked and the last one is shown.
	return { rooms: await rooms(locals.db), last };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
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
		redirect(303, `/plants/new?added=${id}`);
	}
};
