import { fail } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { addDays, today } from '../dates.ts';
import { stackName } from '../stacks.ts';
import type { Check, Done } from '../watering.ts';
import { getPlant, recordCheck, undoCheck } from './plants.ts';

const ids = (form: FormData, name: string) => form.getAll(name).map(Number);

/** How far back a watering can be put in, so a mistyped year can't. */
export const BACKDATE_DAYS = 30;

// One plant, or a stack of them (Today's grid stacks plants watered together).
// A plant's page can give an earlier `day` for a watering nobody tapped.
function record(kind: Check) {
	return async ({ request, locals }: RequestEvent) => {
		const form = await request.formData();
		const now = today();
		const day = String(form.get('day') ?? '') || now;
		if (day > now || day < addDays(now, -BACKDATE_DAYS) || !/^\d{4}-\d{2}-\d{2}$/.test(day))
			return fail(400, { error: 'Pick a day in the last month' });
		const plants = [];
		const checkIds = [];
		for (const id of ids(form, 'id')) {
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
