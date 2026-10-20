import { describe, expect, it } from 'vitest';
import { baseName, stackName, stacks } from './stacks.ts';

const p = (name: string, roomId: number, species: string | null, checked = '') => ({
	name,
	roomId,
	species,
	checked
});

describe('stacks', () => {
	it('stacks the same species in the same room, in order', () => {
		const a = p('Spider plant (grey pot)', 1, 'Chlorophytum');
		const b = p('Fern', 1, 'Nephrolepis');
		const c = p('Spider plant (big)', 1, 'Chlorophytum');
		const d = p('Spider plant', 2, 'Chlorophytum');
		expect(stacks([a, b, c, d])).toEqual([[a, c], [b], [d]]);
	});

	it('leaves plants with no species alone', () => {
		const a = p('[unknown]', 1, null);
		const b = p('[unknown]', 1, null);
		expect(stacks([a, b])).toEqual([[a], [b]]);
	});

	it('splits by the extra key', () => {
		const a = p('Pothos', 1, 'Epipremnum', 'watered');
		const b = p('Pothos', 1, 'Epipremnum');
		const c = p('Pothos', 1, 'Epipremnum');
		expect(stacks([a, b, c], (x) => x.checked)).toEqual([[a], [b, c]]);
	});
});

describe('names', () => {
	it('drops the bracketed part', () => {
		expect(baseName('Peace lily (terracotta pot)')).toBe('Peace lily');
		expect(baseName('Monstera')).toBe('Monstera');
	});

	it('counts a stack', () => {
		expect(stackName([{ name: 'Fern' }])).toBe('Fern');
		expect(stackName([{ name: 'Pothos (big)' }, { name: 'Pothos (hanging)' }])).toBe('Pothos ×2');
	});
});
