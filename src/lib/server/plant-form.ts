import type { DB } from './db/index.ts';
import { defaultName, roomNamed, type PlantInput } from './plants.ts';
import { MAX_INTERVAL, MIN_INTERVAL } from '../watering.ts';

const text = (form: FormData, name: string) => {
	const v = String(form.get(name) ?? '').trim();
	return v || null;
};

/**
 * Reads the add and edit forms. The room is an existing one's id, or "new"
 * with a name in newRoom. The name can be left blank: it's then the room's
 * name and a number, like "Kitchen plant 2".
 */
export async function readPlantForm(
	db: DB,
	form: FormData
): Promise<PlantInput | { error: string }> {
	const interval = Number(form.get('interval'));
	if (!Number.isInteger(interval) || interval < MIN_INTERVAL || interval > MAX_INTERVAL)
		return { error: `Water every ${MIN_INTERVAL} to ${MAX_INTERVAL} days` };

	const picked = String(form.get('room') ?? '');
	const newRoom = text(form, 'newRoom');
	let roomId: number;
	if (picked && picked !== 'new') roomId = Number(picked);
	else if (newRoom) roomId = await roomNamed(db, newRoom);
	else return { error: 'Pick a room, or type a new one' };
	if (!Number.isInteger(roomId)) return { error: 'Pick a room, or type a new one' };

	return {
		roomId,
		intervalDays: interval,
		name: text(form, 'name') ?? (await defaultName(db, roomId)),
		species: text(form, 'species'),
		notes: text(form, 'notes')
	};
}
