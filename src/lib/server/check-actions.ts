import { fail } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { today } from '../dates.ts';
import type { Check, Done } from '../watering.ts';
import { getPlant, recordCheck, undoCheck } from './plants.ts';

function record(kind: Check) {
	return async ({ request, locals }: RequestEvent) => {
		const id = Number((await request.formData()).get('id'));
		const p = await getPlant(locals.db, id);
		if (!p) return fail(404, { error: 'That plant has gone' });
		const checkId = await recordCheck(locals.db, id, kind, locals.user!.id, today());
		return { done: { checkId: checkId!, kind, name: p.name } satisfies Done };
	};
}

/** Watered, Still damp and Undo: the same on the Today page and a plant's page. */
export const checkActions = {
	water: record('watered'),
	damp: record('damp'),
	undo: async ({ request, locals }: RequestEvent) => {
		await undoCheck(locals.db, Number((await request.formData()).get('checkId')));
		return { undone: true };
	}
};
