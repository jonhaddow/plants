import { error, redirect } from '@sveltejs/kit';
import { addDays, today } from '#lib/dates.ts';
import { BACKDATE_DAYS, checkActions } from '#lib/server/check-actions.ts';
import { deletePhoto } from '#lib/server/photos.ts';
import { deletePlant, getPlant, history } from '#lib/server/plants.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const id = Number(params.id);
	const [plant, checks] = await Promise.all([getPlant(locals.db, id), history(locals.db, id)]);
	if (!plant) error(404, 'No such plant');
	const day = today();
	return { plant, checks, today: day, earliest: addDays(day, -BACKDATE_DAYS) };
};

export const actions: Actions = {
	...checkActions,
	delete: async ({ locals, params }) => {
		await deletePhoto(locals.db, await deletePlant(locals.db, Number(params.id)));
		redirect(303, '/plants');
	}
};
