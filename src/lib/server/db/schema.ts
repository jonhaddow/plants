import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { CHECKS } from '../../watering.ts';

// Days are UK dates as YYYY-MM-DD text; times are ISO timestamps.

/** People who can sign in (Google accounts). */
export const user = sqliteTable('user', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	email: text('email').notNull().unique(),
	name: text('name').notNull()
});

export type User = typeof user.$inferSelect;

/** Signed-in sessions. The id is the SHA-256 of the cookie's token, never the token itself. */
export const session = sqliteTable(
	'session',
	{
		id: text('id').primaryKey(),
		userId: integer('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		expiresAt: text('expires_at').notNull()
	},
	(t) => [index('session_user_idx').on(t.userId)]
);

/** Devices that asked for push notifications (one row per browser/phone). */
export const pushSubscription = sqliteTable('push_subscription', {
	endpoint: text('endpoint').primaryKey(),
	p256dh: text('p256dh').notNull(),
	auth: text('auth').notNull(),
	userId: integer('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	createdAt: text('created_at').notNull()
});

/** Rooms of the house, in the order you'd walk round watering. */
export const room = sqliteTable('room', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull().unique(),
	sortOrder: integer('sort_order').notNull().default(0)
});

export type Room = typeof room.$inferSelect;

/**
 * A plant. It's due on `dueOn`; watering it moves that on by `intervalDays`,
 * and the interval learns from what actually happens (see watering.ts).
 */
export const plant = sqliteTable(
	'plant',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		roomId: integer('room_id')
			.notNull()
			.references(() => room.id),
		name: text('name').notNull(),
		/** What it is, if known ("Monstera deliciosa"). */
		species: text('species'),
		notes: text('notes'),
		/** Its photo (photo.key). */
		photoKey: text('photo_key'),
		intervalDays: integer('interval_days').notNull().default(7),
		dueOn: text('due_on').notNull(),
		lastWateredOn: text('last_watered_on'),
		/** New, waiting for Claude to name it and set its care from the photo (see the classify-plants skill). */
		needsSetup: integer('needs_setup', { mode: 'boolean' }).notNull().default(true),
		createdAt: text('created_at').notNull()
	},
	(t) => [index('plant_room_idx').on(t.roomId), index('plant_due_idx').on(t.dueOn)]
);

export type Plant = typeof plant.$inferSelect;

/**
 * Plant photos, base64 JPEGs of about 200 KB (shrunk on the phone). Kept out of
 * the plant table so lists never load them.
 */
export const photo = sqliteTable('photo', {
	key: text('key').primaryKey(),
	type: text('type').notNull(),
	data: text('data').notNull()
});

/** Each time someone watered a plant, or found it still damp. */
export const check = sqliteTable(
	'check',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		plantId: integer('plant_id')
			.notNull()
			.references(() => plant.id, { onDelete: 'cascade' }),
		userId: integer('user_id').references(() => user.id, { onDelete: 'set null' }),
		kind: text('kind', { enum: CHECKS }).notNull(),
		day: text('day').notNull(),
		at: text('at').notNull(),
		/** The plant's schedule before this check (JSON), so a mis-tap can be undone. */
		before: text('before').notNull()
	},
	(t) => [index('check_plant_idx').on(t.plantId, t.at)]
);
