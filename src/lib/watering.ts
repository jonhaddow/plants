// How a plant's schedule learns. Each plant has an interval: watering it
// makes it due again that many days later. Two things teach it:
// - "Still damp" when it comes due: it needs at least that long plus a bit,
//   so the interval grows and it comes back for another look in a few days.
// - Watering it before it was due (it was dry already): the interval moves
//   halfway towards how long it actually went.
// Watering it late teaches nothing: that's usually just a busy week.
import { addDays, daysBetween } from './dates.ts';

/** What someone found: they watered it, or it was still damp so they left it. */
export const CHECKS = ['watered', 'damp'] as const;
export type Check = (typeof CHECKS)[number];

/** A check just made, for the page to say what happened and offer Undo. */
export type Done = { checkIds: number[]; kind: Check; name: string };

export const MIN_INTERVAL = 1;
export const MAX_INTERVAL = 60;

export type Schedule = { intervalDays: number; dueOn: string; lastWateredOn: string | null };

const clamp = (n: number) => Math.min(MAX_INTERVAL, Math.max(MIN_INTERVAL, Math.round(n)));

/** How many days to wait before looking again at a plant that was still damp. */
export const recheckDays = (interval: number) => Math.min(7, Math.max(1, Math.round(interval / 4)));

export function afterWatering(s: Schedule, today: string): Schedule {
	let interval = s.intervalDays;
	const gap = s.lastWateredOn ? daysBetween(s.lastWateredOn, today) : null;
	if (gap !== null && gap >= 1 && gap < interval) interval = clamp((interval + gap) / 2);
	return { intervalDays: interval, dueOn: addDays(today, interval), lastWateredOn: today };
}

export function afterDamp(s: Schedule, today: string): Schedule {
	const wait = recheckDays(s.intervalDays);
	const since = s.lastWateredOn ? daysBetween(s.lastWateredOn, today) : s.intervalDays;
	return {
		intervalDays: clamp(Math.max(s.intervalDays, since + wait)),
		dueOn: addDays(today, wait),
		lastWateredOn: s.lastWateredOn
	};
}

/** The intervals offered when adding a plant; the schedule learns from there. */
export const INTERVALS = [
	{ days: 3, label: 'Every few days' },
	{ days: 7, label: 'Weekly' },
	{ days: 14, label: 'Fortnightly' },
	{ days: 30, label: 'Monthly' }
] as const;

/** "Every 9 days", "Weekly", "Every 2 weeks". */
export function describeInterval(days: number) {
	if (days === 1) return 'Every day';
	if (days === 7) return 'Weekly';
	if (days % 7 === 0) return `Every ${days / 7} weeks`;
	return `Every ${days} days`;
}
