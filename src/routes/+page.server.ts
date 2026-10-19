import { today } from '#lib/dates.ts';
import { plantCount, todayPlants, upcomingPlants } from '#lib/server/plants.ts';
import { checkActions } from '#lib/server/check-actions.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const day = today();
	const [plants, upcoming, count] = await Promise.all([
		todayPlants(locals.db, day),
		upcomingPlants(locals.db, day),
		plantCount(locals.db)
	]);
	// Found damp today, it's back in a day or two; it's on the grid already.
	const onGrid = new Set(plants.map((p) => p.id));
	return {
		today: day,
		plants,
		upcoming: upcoming.filter((p) => !onGrid.has(p.id)),
		plantCount: count
	};
};

export const actions: Actions = checkActions;
