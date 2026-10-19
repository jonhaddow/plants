import { today } from '#lib/dates.ts';
import { dueCount } from '#lib/server/plants.ts';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) return { user: null, due: 0 };
	return {
		user: { name: locals.user.name, email: locals.user.email },
		due: await dueCount(locals.db, today())
	};
};
