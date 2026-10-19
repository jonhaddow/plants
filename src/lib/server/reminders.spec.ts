import { describe, expect, it } from 'vitest';
import { dueNotice } from './reminders.ts';

describe('dueNotice', () => {
	it('names the plants room by room', () => {
		expect(
			dueNotice([
				{ name: 'Fern', roomId: 1, room: 'Living room' },
				{ name: 'Monstera', roomId: 1, room: 'Living room' },
				{ name: 'Basil', roomId: 2, room: 'Kitchen' }
			])
		).toEqual({
			title: '3 plants need water',
			body: 'Living room: Fern, Monstera · Kitchen: Basil',
			url: '/',
			badge: 3,
			tag: 'due'
		});
	});

	it('names a lone plant in the title', () => {
		expect(dueNotice([{ name: 'Fern', roomId: 1, room: 'Living room' }]).title).toBe(
			'Fern needs water'
		);
	});
});
