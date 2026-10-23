<script lang="ts">
	import { enhance } from '$app/forms';
	import { daysBetween } from '#lib/dates.ts';
	import { baseName, stackName } from '#lib/stacks.ts';
	import type { Check } from '#lib/watering.ts';

	// A plant on Today's grid, or a stack of the same kind watered together. Tap
	// the photo: Watered. The corner button: Still damp. Once checked it stays,
	// tinted, and a second tap undoes it. A stack's ×n badge splits it up.
	let {
		plants,
		today,
		onsplit
	}: {
		plants: {
			id: number;
			name: string;
			room: string;
			photoKey: string | null;
			dueOn: string;
			checkId: number | null;
			checked: Check | null;
		}[];
		today: string;
		onsplit?: () => void;
	} = $props();

	let busy = $state(false);
	const plant = $derived(plants[0]);
	const name = $derived(stackName(plants));
	const late = $derived(
		plant.checked ? 0 : Math.max(...plants.map((p) => daysBetween(p.dueOn, today)))
	);
</script>

<form
	method="POST"
	class="tile"
	class:busy
	data-checked={plant.checked}
	use:enhance={() => {
		busy = true;
		return async ({ update }) => {
			await update({ reset: false });
			busy = false;
		};
	}}
>
	{#if plant.photoKey}
		<img src="/photos/{plant.photoKey}" alt="" loading="lazy" />
	{:else}
		<span class="none" aria-hidden="true">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
				<path
					d="M12 21v-8M12 13c0-4 2.5-7 7-7 0 4.5-3 7-7 7ZM12 15c0-3-2-5.5-6-5.5 0 3.5 2.5 5.5 6 5.5Z"
				/>
			</svg>
		</span>
	{/if}

	{#if plant.checked}
		{#each plants as p (p.id)}<input type="hidden" name="checkId" value={p.checkId} />{/each}
		<button
			class="main"
			formaction="?/undo"
			aria-label="Undo {plant.checked === 'watered' ? `watering ${name}` : `${name} still damp`}"
		></button>
		<span class="done">
			{#if plant.checked === 'watered'}
				<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
					<path d="M12 3.5c3 3.6 6 7 6 10.3a6 6 0 0 1-12 0c0-3.3 3-6.7 6-10.3Z" />
				</svg>
				Watered
			{:else}
				Still damp
			{/if}
		</span>
	{:else}
		{#each plants as p (p.id)}<input type="hidden" name="id" value={p.id} />{/each}
		<button class="main" formaction="?/water" aria-label="Watered {name}"></button>
		{#if late > 0}<span class="late">{late}d late</span>{/if}
		<button class="damp" formaction="?/damp" aria-label="{name} is still damp">Damp</button>
	{/if}

	<span class="label">
		<strong>{plants.length > 1 ? baseName(plant.name) : plant.name}</strong>
		<small>{plant.room}</small>
	</span>
	{#if plants.length > 1}
		<button
			type="button"
			class="count"
			onclick={onsplit}
			aria-label="Show the {plants.length} separately">×{plants.length}</button
		>
	{/if}
</form>

<style>
	.tile {
		position: relative;
		aspect-ratio: 3 / 4;
		border-radius: var(--radius);
		overflow: hidden;
		background: var(--line);
		box-shadow: var(--shadow);
		user-select: none;
		-webkit-user-select: none;
	}
	/* Pressed: the tile sinks a little, and its small buttons shrink. */
	.tile {
		transition: scale 0.12s ease-out;
	}
	.tile:has(.main:active) {
		scale: 0.97;
	}
	.damp,
	.count {
		transition: scale 0.1s ease-out;
	}
	.damp:active,
	.count:active {
		scale: 0.9;
	}
	img,
	.none {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.none {
		display: grid;
		place-items: center;
		color: var(--muted);
	}
	.none svg {
		width: 40%;
	}
	/* The whole tile is the button; everything else sits on top without catching taps. */
	.main {
		position: absolute;
		inset: 0;
		border: 0;
		background: none;
		cursor: pointer;
	}
	.main:focus-visible {
		outline: 3px solid var(--ink);
		outline-offset: -3px;
		border-radius: var(--radius);
	}
	.label,
	.late,
	.done {
		pointer-events: none;
	}
	.label {
		position: absolute;
		inset: auto 0 0;
		padding: 28px 12px 10px;
		display: flex;
		flex-direction: column;
		background: linear-gradient(transparent, rgb(0 0 0 / 0.6));
		color: #fff;
	}
	.label strong {
		font-size: 17px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.label small {
		font-size: 13px;
		opacity: 0.9;
	}
	.late {
		position: absolute;
		top: 10px;
		left: 10px;
		padding: 3px 9px;
		border-radius: 999px;
		background: #b8452a;
		color: #fff;
		font-size: 12px;
		font-weight: 800;
	}
	.count {
		position: absolute;
		right: 6px;
		bottom: 6px;
		min-width: 44px;
		min-height: 36px;
		padding: 0 10px;
		border: 0;
		border-radius: 999px;
		background: rgb(255 255 255 / 0.88);
		color: #18211b;
		font-size: 15px;
		font-weight: 900;
		cursor: pointer;
	}
	/* A stack: a second card peeking out behind. */
	.tile:has(.count) {
		box-shadow:
			var(--shadow),
			7px 7px 0 -1px var(--card),
			7px 7px 0 0 rgb(0 0 0 / 0.18);
	}
	.tile:has(.count) .label {
		padding-right: 60px;
	}
	.damp {
		position: absolute;
		top: 6px;
		right: 6px;
		min-height: 36px;
		padding: 0 12px;
		border: 0;
		border-radius: 999px;
		background: rgb(255 255 255 / 0.88);
		color: #18211b;
		font-size: 13px;
		font-weight: 800;
		cursor: pointer;
	}
	.done {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;
		color: #fff;
		font-size: 18px;
		font-weight: 900;
		animation: fade 0.2s ease-out;
	}
	.done svg {
		width: 40px;
		height: 40px;
	}
	[data-checked='watered'] .done {
		background: rgb(42 111 176 / 0.8);
	}
	[data-checked='damp'] .done {
		background: rgb(150 108 40 / 0.82);
	}
	.busy {
		opacity: 0.6;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
	}
</style>
