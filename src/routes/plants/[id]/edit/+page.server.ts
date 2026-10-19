import { error, fail, redirect } from '@sveltejs/kit';
import { today } from '#lib/dates.ts';
import { readPlantForm } from '#lib/server/plant-form.ts';
import { deletePhoto, photoFrom, savePhoto } from '#lib/server/photos.ts';
import { getPlant, rooms, setPhoto, updatePlant } from '#lib/server/plants.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const plant = await getPlant(locals.db, Number(params.id));
	if (!plant) error(404, 'No such plant');
	return { plant, rooms: await rooms(locals.db) };
};

export const actions: Actions = {
	default: async ({ request, locals, params }) => {
		const id = Number(params.id);
		const plant = await getPlant(locals.db, id);
		if (!plant) error(404, 'No such plant');
		const form = await request.formData();
		const photo = photoFrom(form);
		if (photo === 'invalid') return fail(400, { error: 'That photo didn’t work; try another' });
		const input = await readPlantForm(locals.db, form);
		if ('error' in input) return fail(400, { error: input.error });
		await updatePlant(locals.db, id, input, today());
		if (photo) {
			await setPhoto(locals.db, id, await savePhoto(locals.db, photo));
			await deletePhoto(locals.db, plant.photoKey);
		}
		redirect(303, `/plants/${id}`);
	}
};
