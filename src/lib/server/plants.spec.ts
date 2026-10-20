import { beforeEach, describe, expect, it } from 'vitest';
import { testDb } from './test-db.ts';
import * as schema from './db/schema.ts';
import type { DB } from './db/index.ts';
import {
	addPlant,
	duePlants,
	getPlant,
	groupByRoom,
	history,
	recordCheck,
	roomNamed,
	speciesInUse,
	todayPlants,
	undoCheck,
	upcomingPlants,
	updatePlant
} from './plants.ts';
import { readPlantForm } from './plant-form.ts';

let db: DB;
let alex: number;
const today = '2026-10-19';

beforeEach(async () => {
	db = await testDb();
	[{ id: alex }] = await db
		.insert(schema.user)
		.values({ email: 'alex@example.com', name: 'Alex' })
		.returning();
});

const plant = (name: string, roomId: number, intervalDays = 7, wateredToday = true) =>
	addPlant(db, { name, roomId, intervalDays, species: null, notes: null, wateredToday }, today);

describe('rooms', () => {
	it('reuses a room whatever the case, and puts new ones last', async () => {
		const living = await roomNamed(db, 'Living room');
		expect(await roomNamed(db, ' living  ROOM ')).toBe(living);
		const kitchen = await roomNamed(db, 'Kitchen');
		const order = (await db.select().from(schema.room)).sort((a, b) => a.sortOrder - b.sortOrder);
		expect(order.map((r) => r.id)).toEqual([living, kitchen]);
	});
});

describe('species in use', () => {
	it('lists each once, A to Z, skipping unknowns', async () => {
		const room = await roomNamed(db, 'Lounge');
		const add = (species: string | null) =>
			addPlant(
				db,
				{ name: 'x', roomId: room, intervalDays: 7, species, notes: null, wateredToday: true },
				today
			);
		await add('Pilea');
		await add(null);
		await add('Epipremnum');
		await add('Pilea');
		expect(await speciesInUse(db)).toEqual(['Epipremnum', 'Pilea']);
	});
});

describe('adding', () => {
	it('is due one interval on if watered today, else today', async () => {
		const room = await roomNamed(db, 'Kitchen');
		const a = await plant('Basil', room, 3);
		const b = await plant('Mint', room, 3, false);
		expect((await getPlant(db, a))!.dueOn).toBe('2026-10-22');
		expect((await getPlant(db, b))!.dueOn).toBe(today);
	});

	it('names an unnamed plant after its room', async () => {
		const room = await roomNamed(db, 'Kitchen');
		await plant('Basil', room);
		const form = new FormData();
		form.set('room', String(room));
		form.set('interval', '7');
		expect(await readPlantForm(db, form)).toMatchObject({ name: 'Kitchen plant 2', roomId: room });
	});

	it('makes a new room from the form', async () => {
		const form = new FormData();
		form.set('room', 'new');
		form.set('newRoom', 'Hall');
		form.set('interval', '7');
		const input = await readPlantForm(db, form);
		expect(input).toMatchObject({ name: 'Hall plant 1' });
		expect((await db.select().from(schema.room)).map((r) => r.name)).toEqual(['Hall']);
	});

	it('refuses a missing room or a silly interval', async () => {
		const form = new FormData();
		form.set('interval', '7');
		expect(await readPlantForm(db, form)).toEqual({ error: 'Pick a room, or type a new one' });
		form.set('room', 'new');
		form.set('newRoom', 'Hall');
		form.set('interval', '0');
		expect(await readPlantForm(db, form)).toHaveProperty('error');
	});
});

describe('due and upcoming', () => {
	it('lists what is due by room, and the week ahead', async () => {
		const kitchen = await roomNamed(db, 'Kitchen');
		const living = await roomNamed(db, 'Living room');
		await plant('Basil', kitchen, 3, false);
		await plant('Fern', living, 7, false);
		await plant('Cactus', living, 30);
		await plant('Palm', living, 5);
		const due = groupByRoom(await duePlants(db, today));
		expect(due.map((r) => [r.name, r.plants.map((p) => p.name)])).toEqual([
			['Kitchen', ['Basil']],
			['Living room', ['Fern']]
		]);
		expect((await upcomingPlants(db, today)).map((p) => p.name)).toEqual(['Palm']);
	});

	it('keeps plants checked today on Today, with the check to undo', async () => {
		const living = await roomNamed(db, 'Living room');
		const fern = await plant('Fern', living, 7, false);
		await plant('Monstera', living, 7, false);
		await plant('Cactus', living, 30);
		const checkId = await recordCheck(db, fern, 'watered', alex, today);
		expect(await todayPlants(db, today)).toMatchObject([
			{ name: 'Fern', checkId, checked: 'watered' },
			{ name: 'Monstera', checkId: null, checked: null }
		]);
		await undoCheck(db, checkId!);
		expect((await todayPlants(db, today))[0]).toMatchObject({ name: 'Fern', checkId: null });
		await recordCheck(db, fern, 'damp', alex, today);
		expect((await todayPlants(db, '2026-10-20')).map((p) => p.name)).toEqual(['Monstera']);
	});
});

describe('checks', () => {
	it('watering moves it on and is remembered with who did it', async () => {
		const id = await plant('Fern', await roomNamed(db, 'Living room'), 7, false);
		await recordCheck(db, id, 'watered', alex, today);
		expect(await getPlant(db, id)).toMatchObject({ dueOn: '2026-10-26', lastWateredOn: today });
		expect(await history(db, id)).toMatchObject([{ kind: 'watered', day: today, who: 'Alex' }]);
	});

	it('undo puts the schedule back as it was', async () => {
		const id = await plant('Fern', await roomNamed(db, 'Living room'), 7, false);
		const before = await getPlant(db, id);
		const checkId = await recordCheck(db, id, 'damp', alex, today);
		expect((await getPlant(db, id))!.dueOn).not.toBe(before!.dueOn);
		expect(await undoCheck(db, checkId!)).toBe(id);
		expect(await getPlant(db, id)).toEqual(before);
		expect(await history(db, id)).toEqual([]);
	});

	it('ignores a plant that has gone', async () => {
		expect(await recordCheck(db, 999, 'watered', alex, today)).toBeNull();
	});
});

describe('editing', () => {
	it('a new interval moves the due date to match', async () => {
		const room = await roomNamed(db, 'Kitchen');
		const id = await plant('Basil', room, 3);
		await updatePlant(
			db,
			id,
			{ name: 'Basil', roomId: room, intervalDays: 5, species: null, notes: null },
			today
		);
		expect((await getPlant(db, id))!.dueOn).toBe('2026-10-24');
	});
});
