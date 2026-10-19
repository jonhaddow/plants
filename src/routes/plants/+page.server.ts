import { allPlants, groupByRoom } from '#lib/server/plants.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => ({
	rooms: groupByRoom(await allPlants(locals.db))
});
