import { and, asc, desc, eq, gt, isNotNull, lte, or, sql } from 'drizzle-orm';
import { check, plant, room, user, type Plant } from './db/schema.ts';
import type { DB } from './db/index.ts';
import { addDays } from '../dates.ts';
import { afterDamp, afterWatering, type Check } from '../watering.ts';

/** A plant as lists show it. */
export type PlantRow = Pick<Plant, 'id' | 'name' | 'photoKey' | 'dueOn' | 'intervalDays'> & {
	roomId: number;
	room: string;
};

const listColumns = {
	id: plant.id,
	name: plant.name,
	photoKey: plant.photoKey,
	dueOn: plant.dueOn,
	intervalDays: plant.intervalDays,
	roomId: room.id,
	room: room.name
};

const byRoom = [asc(room.sortOrder), asc(room.id)];

/** Plants due today or overdue, room by room, most overdue first. */
export function duePlants(db: DB, today: string): Promise<PlantRow[]> {
	return db
		.select(listColumns)
		.from(plant)
		.innerJoin(room, eq(plant.roomId, room.id))
		.where(lte(plant.dueOn, today))
		.orderBy(...byRoom, asc(plant.dueOn), asc(plant.name));
}

/**
 * Today's grid: plants due, plus those already watered or found damp today
 * (with that check, so a tap can undo it). Room by room, then by name, so
 * tiles stay put when tapped.
 */
export function todayPlants(db: DB, today: string) {
	const latestToday = sql`(SELECT max(id) FROM "check" WHERE plant_id = ${plant.id} AND day = ${today})`;
	return db
		.select({ ...listColumns, checkId: check.id, checked: check.kind })
		.from(plant)
		.innerJoin(room, eq(plant.roomId, room.id))
		.leftJoin(check, eq(check.id, latestToday))
		.where(or(lte(plant.dueOn, today), isNotNull(check.id)))
		.orderBy(...byRoom, asc(plant.name));
}

/** Plants due in the next week, soonest first. */
export function upcomingPlants(db: DB, today: string): Promise<PlantRow[]> {
	return db
		.select(listColumns)
		.from(plant)
		.innerJoin(room, eq(plant.roomId, room.id))
		.where(and(gt(plant.dueOn, today), lte(plant.dueOn, addDays(today, 7))))
		.orderBy(asc(plant.dueOn), ...byRoom, asc(plant.name));
}

/** How many plants are due (today), or how many there are. */
export async function dueCount(db: DB, today?: string) {
	const [row] = await db
		.select({ n: sql<number>`count(*)` })
		.from(plant)
		.where(today ? lte(plant.dueOn, today) : undefined);
	return row.n;
}

export const plantCount = (db: DB) => dueCount(db);

/** Every plant, room by room. */
export function allPlants(db: DB): Promise<PlantRow[]> {
	return db
		.select(listColumns)
		.from(plant)
		.innerJoin(room, eq(plant.roomId, room.id))
		.orderBy(...byRoom, asc(plant.name));
}

/** Rows grouped under their room, keeping their order. */
export function groupByRoom<T extends { roomId: number; room: string }>(rows: T[]) {
	const rooms: { id: number; name: string; plants: T[] }[] = [];
	for (const r of rows) {
		if (rooms.at(-1)?.id !== r.roomId) rooms.push({ id: r.roomId, name: r.room, plants: [] });
		rooms.at(-1)!.plants.push(r);
	}
	return rooms;
}

export function rooms(db: DB) {
	return db
		.select()
		.from(room)
		.orderBy(...byRoom);
}

/** The room with this name (any case), made if it's new. New rooms go last. */
export async function roomNamed(db: DB, name: string) {
	const clean = name.trim().replace(/\s+/g, ' ');
	const existing = (await rooms(db)).find((r) => r.name.toLowerCase() === clean.toLowerCase());
	if (existing) return existing.id;
	const [made] = await db
		.insert(room)
		.values({
			name: clean,
			sortOrder: sql`(SELECT coalesce(max(sort_order), -1) + 1 FROM room)`
		})
		.returning({ id: room.id });
	return made.id;
}

/** "Kitchen plant 2": for a plant added without a name. */
export async function defaultName(db: DB, roomId: number) {
	const [r] = await db
		.select({
			name: room.name,
			n: sql<number>`(SELECT count(*) FROM plant WHERE room_id = ${roomId})`
		})
		.from(room)
		.where(eq(room.id, roomId));
	return r ? `${r.name} plant ${r.n + 1}` : 'Plant';
}

export async function getPlant(db: DB, id: number) {
	const [row] = await db
		.select({ plant, room: room.name })
		.from(plant)
		.innerJoin(room, eq(plant.roomId, room.id))
		.where(eq(plant.id, id));
	return row ? { ...row.plant, room: row.room } : null;
}

export type PlantInput = {
	name: string;
	roomId: number;
	intervalDays: number;
	species: string | null;
	notes: string | null;
};

/** A new plant. Watered today, it's next due one interval on; otherwise today. */
export async function addPlant(
	db: DB,
	input: PlantInput & { wateredToday: boolean },
	today: string,
	now = new Date()
) {
	const { wateredToday, ...fields } = input;
	const [made] = await db
		.insert(plant)
		.values({
			...fields,
			dueOn: wateredToday ? addDays(today, input.intervalDays) : today,
			lastWateredOn: wateredToday ? today : null,
			createdAt: now.toISOString()
		})
		.returning({ id: plant.id });
	return made.id;
}

/** Saves edits. A changed interval moves the due date to match. */
export async function updatePlant(db: DB, id: number, input: PlantInput, today: string) {
	const current = await getPlant(db, id);
	if (!current) return;
	const dueOn =
		input.intervalDays === current.intervalDays
			? current.dueOn
			: addDays(current.lastWateredOn ?? today, input.intervalDays);
	await db
		.update(plant)
		.set({ ...input, dueOn })
		.where(eq(plant.id, id));
}

export async function setPhoto(db: DB, id: number, photoKey: string) {
	await db.update(plant).set({ photoKey }).where(eq(plant.id, id));
}

/** Deletes a plant (and its history); returns its photo's key so that can go too. */
export async function deletePlant(db: DB, id: number) {
	const [gone] = await db
		.delete(plant)
		.where(eq(plant.id, id))
		.returning({ photoKey: plant.photoKey });
	return gone?.photoKey ?? null;
}

/**
 * Records watering a plant or finding it still damp, and moves its schedule
 * on. Returns the check's id (for undo), or null if there's no such plant.
 */
export async function recordCheck(
	db: DB,
	plantId: number,
	kind: Check,
	userId: number | null,
	today: string,
	now = new Date()
) {
	const p = await getPlant(db, plantId);
	if (!p) return null;
	const before = { intervalDays: p.intervalDays, dueOn: p.dueOn, lastWateredOn: p.lastWateredOn };
	const after = kind === 'watered' ? afterWatering(before, today) : afterDamp(before, today);
	const [, [made]] = await db.batch([
		db.update(plant).set(after).where(eq(plant.id, plantId)),
		db
			.insert(check)
			.values({
				plantId,
				userId,
				kind,
				day: today,
				at: now.toISOString(),
				before: JSON.stringify(before)
			})
			.returning({ id: check.id })
	]);
	return made.id;
}

/** Takes back a check (a mis-tap): the plant's schedule goes back to how it was. */
export async function undoCheck(db: DB, checkId: number) {
	const [c] = await db.select().from(check).where(eq(check.id, checkId));
	if (!c) return null;
	await db.batch([
		db.update(plant).set(JSON.parse(c.before)).where(eq(plant.id, c.plantId)),
		db.delete(check).where(eq(check.id, checkId))
	]);
	return c.plantId;
}

/** A plant's recent checks, newest first, with who did them. */
export function history(db: DB, plantId: number, limit = 10) {
	return db
		.select({ id: check.id, kind: check.kind, day: check.day, who: user.name })
		.from(check)
		.leftJoin(user, eq(check.userId, user.id))
		.where(eq(check.plantId, plantId))
		.orderBy(desc(check.at), desc(check.id))
		.limit(limit);
}
