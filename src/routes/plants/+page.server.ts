import { allPlants, groupByRoom } from '#lib/server/plants.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const plants = await allPlants(locals.db);
	return {
		toSetUp: plants.filter((p) => p.needsSetup),
		rooms: groupByRoom(plants.filter((p) => !p.needsSetup))
	};
};
