import { describe, expect, it } from 'vitest';
import { dueNotice } from './reminders.ts';

describe('dueNotice', () => {
	it('names the plants room by room, stacking the same species', () => {
		expect(
			dueNotice([
				{ name: 'Fern', species: null, roomId: 1, room: 'Living room' },
				{ name: 'Pothos (big)', species: 'Epipremnum', roomId: 1, room: 'Living room' },
				{ name: 'Monstera', species: null, roomId: 1, room: 'Living room' },
				{ name: 'Pothos (hanging)', species: 'Epipremnum', roomId: 1, room: 'Living room' },
				{ name: 'Basil', species: null, roomId: 2, room: 'Kitchen' }
			])
		).toEqual({
			title: '5 plants need water',
			body: 'Living room: Fern, Pothos ×2, Monstera · Kitchen: Basil',
			url: '/',
			badge: 5,
			tag: 'due'
		});
	});

	it('names a lone plant in the title', () => {
		expect(dueNotice([{ name: 'Fern', species: null, roomId: 1, room: 'Living room' }]).title).toBe(
			'Fern needs water'
		);
	});
});
