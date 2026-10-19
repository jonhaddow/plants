import { today } from '#lib/dates.ts';
import { duePlants, groupByRoom, plantCount, upcomingPlants } from '#lib/server/plants.ts';
import { checkActions } from '#lib/server/check-actions.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const day = today();
	const [due, upcoming, count] = await Promise.all([
		duePlants(locals.db, day),
		upcomingPlants(locals.db, day),
		plantCount(locals.db)
	]);
	return { today: day, due: groupByRoom(due), upcoming, plantCount: count };
};

export const actions: Actions = checkActions;
