/** "Spider plant (grey pot)" → "Spider plant". */
export function baseName(name: string) {
	return name.replace(/\s*\(.*\)$/, '');
}

/**
 * Plants of the same species in the same room, which get watered together, as
 * one stack each (in first-seen order). `extra` splits stacks further, e.g. by
 * what's been done today. Plants with no species stand alone.
 */
export function stacks<T extends { roomId: number; species: string | null }>(
	plants: T[],
	extra: (p: T) => string = () => ''
): T[][] {
	const byKey = new Map<string, T[]>();
	const out: T[][] = [];
	for (const p of plants) {
		const key = p.species && `${p.roomId}|${p.species}|${extra(p)}`;
		const stack = key ? byKey.get(key) : undefined;
		if (stack) stack.push(p);
		else {
			const fresh = [p];
			out.push(fresh);
			if (key) byKey.set(key, fresh);
		}
	}
	return out;
}

/** A stack's name: "Fern", or "Spider plant ×3". */
export function stackName(stack: { name: string }[]) {
	return stack.length === 1 ? stack[0].name : `${baseName(stack[0].name)} ×${stack.length}`;
}
