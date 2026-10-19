import { describe, expect, it } from 'vitest';
import {
	afterDamp,
	afterWatering,
	describeInterval,
	MAX_INTERVAL,
	type Schedule
} from './watering.ts';

const weekly = { intervalDays: 7, dueOn: '2026-10-08', lastWateredOn: '2026-10-01' };

describe('afterWatering', () => {
	it('makes it due again one interval on', () => {
		expect(afterWatering(weekly, '2026-10-08')).toEqual({
			intervalDays: 7,
			dueOn: '2026-10-15',
			lastWateredOn: '2026-10-08'
		});
	});

	it('learns nothing from watering late', () => {
		expect(afterWatering(weekly, '2026-10-12').intervalDays).toBe(7);
	});

	it('moves halfway towards the actual gap when watered early', () => {
		expect(afterWatering(weekly, '2026-10-04').intervalDays).toBe(5);
	});

	it('ignores a second watering the same day', () => {
		expect(afterWatering({ ...weekly, lastWateredOn: '2026-10-08' }, '2026-10-08')).toMatchObject({
			intervalDays: 7,
			dueOn: '2026-10-15'
		});
	});

	it('handles a plant never watered here', () => {
		expect(afterWatering({ ...weekly, lastWateredOn: null }, '2026-10-08').intervalDays).toBe(7);
	});
});

describe('afterDamp', () => {
	it('looks again in a couple of days and stretches the interval', () => {
		expect(afterDamp(weekly, '2026-10-08')).toEqual({
			intervalDays: 9,
			dueOn: '2026-10-10',
			lastWateredOn: '2026-10-01'
		});
	});

	it('then a watering at the new length keeps it', () => {
		const damp = afterDamp(weekly, '2026-10-08');
		expect(afterWatering(damp, '2026-10-10').intervalDays).toBe(9);
	});

	it('keeps growing while it stays damp, up to a limit', () => {
		let s: Schedule = weekly;
		let day = '2026-10-08';
		for (let i = 0; i < 40; i++) {
			s = afterDamp(s, day);
			day = s.dueOn;
		}
		expect(s.intervalDays).toBe(MAX_INTERVAL);
	});

	it('rechecks in a day for fast drinkers', () => {
		expect(afterDamp({ ...weekly, intervalDays: 2 }, '2026-10-03').dueOn).toBe('2026-10-04');
	});
});

describe('describeInterval', () => {
	it('reads naturally', () => {
		expect(describeInterval(7)).toBe('Weekly');
		expect(describeInterval(14)).toBe('Every 2 weeks');
		expect(describeInterval(9)).toBe('Every 9 days');
		expect(describeInterval(1)).toBe('Every day');
	});
});
