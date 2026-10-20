import { fail } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { today } from '../dates.ts';
import { stackName } from '../stacks.ts';
import type { Check, Done } from '../watering.ts';
import { getPlant, recordCheck, undoCheck } from './plants.ts';

const ids = (form: FormData, name: string) => form.getAll(name).map(Number);

// One plant, or a stack of them (Today's grid stacks plants watered together).
function record(kind: Check) {
	return async ({ request, locals }: RequestEvent) => {
		const day = today();
		const plants = [];
		const checkIds = [];
		for (const id of ids(await request.formData(), 'id')) {
			const p = await getPlant(locals.db, id);
			if (!p) continue;
			plants.push(p);
			checkIds.push((await recordCheck(locals.db, id, kind, locals.user!.id, day))!);
		}
		if (!plants.length) return fail(404, { error: 'That plant has gone' });
		return { done: { checkIds, kind, name: stackName(plants) } satisfies Done };
	};
}

/** Watered, Still damp and Undo: the same on the Today page and a plant's page. */
export const checkActions = {
	water: record('watered'),
	damp: record('damp'),
	undo: async ({ request, locals }: RequestEvent) => {
		for (const id of ids(await request.formData(), 'checkId')) await undoCheck(locals.db, id);
		return { undone: true };
	}
};
