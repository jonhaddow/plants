import type { DB } from './db/index.ts';
import { duePlants, groupByRoom, type PlantRow } from './plants.ts';
import { stackName, stacks } from '../stacks.ts';
import { notify, type PushConfig, type PushPayload } from './push.ts';

/** "5 plants need water" / "Living room: Fern, Pothos ×3 · Kitchen: Basil". */
export function dueNotice(
	due: Pick<PlantRow, 'name' | 'species' | 'roomId' | 'room'>[]
): PushPayload {
	const body = groupByRoom(due)
		.map((r) => `${r.name}: ${stacks(r.plants).map(stackName).join(', ')}`)
		.join(' · ');
	return {
		title: due.length === 1 ? `${due[0].name} needs water` : `${due.length} plants need water`,
		body,
		url: '/',
		badge: due.length,
		// Today's replaces yesterday's if it's still showing.
		tag: 'due'
	};
}

/** The morning reminder to everyone, if anything is due. */
export async function remind(db: DB, cfg: PushConfig, today: string) {
	const due = await duePlants(db, today);
	if (!due.length) return { due: 0 };
	return { due: due.length, ...(await notify(db, cfg, dueNotice(due))) };
}
