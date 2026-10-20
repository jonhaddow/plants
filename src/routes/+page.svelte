<script lang="ts">
	import type { PageProps } from './$types';
	import PlantPhoto from '#lib/components/PlantPhoto.svelte';
	import PlantTile from '#lib/components/PlantTile.svelte';
	import UndoBar from '#lib/components/UndoBar.svelte';
	import { daysBetween, formatDay } from '#lib/dates.ts';
	import { stacks } from '#lib/stacks.ts';
	import { SvelteSet } from 'svelte/reactivity';

	let { data, form }: PageProps = $props();

	const dueCount = $derived(data.plants.filter((p) => !p.checked).length);
	const rooms = $derived([...new Map(data.plants.map((p) => [p.roomId, p.room])).entries()]);
	let roomId = $state<number | null>(null);
	const shown = $derived(
		roomId === null ? data.plants : data.plants.filter((p) => p.roomId === roomId)
	);
	// Same species, same room, same state today: one tile, unless its ×n was tapped.
	const split = new SvelteSet<string>();
	const kind = (p: (typeof data.plants)[number]) => `${p.roomId}|${p.species}`;
	const tiles = $derived(
		stacks(shown, (p) => p.checked ?? '').flatMap((s) =>
			s.length > 1 && split.has(kind(s[0])) ? s.map((p) => [p]) : [s]
		)
	);
	// Coming up, a row per day (already soonest first); tap one to see its plants.
	const days = $derived.by(() => {
		const byDay: { day: string; label: string; plants: typeof data.upcoming }[] = [];
		for (const p of data.upcoming) {
			if (byDay.at(-1)?.day !== p.dueOn)
				byDay.push({
					day: p.dueOn,
					label: daysBetween(data.today, p.dueOn) === 1 ? 'Tomorrow' : formatDay(p.dueOn),
					plants: []
				});
			byDay.at(-1)!.plants.push(p);
		}
		return byDay;
	});
</script>

<svelte:head>
	<title>Today · Plants</title>
</svelte:head>

<main class="page">
	<header>
		<h1>Today</h1>
		{#if dueCount}
			<p class="muted">{dueCount === 1 ? '1 plant needs' : `${dueCount} plants need`} water</p>
		{:else if data.plants.length}
			<p class="muted">All done for today</p>
		{/if}
	</header>

	{#if form?.error}<p class="error" role="alert">{form.error}</p>{/if}

	{#if !data.plantCount}
		<section class="card welcome">
			<h2>Add your plants</h2>
			<p class="muted">
				Walk round with your phone: one photo per plant and which room it’s in. That’s it. Each
				plant learns how often it needs water from what you tap.
			</p>
			<a class="btn primary" href="/plants/new">Add the first plant</a>
		</section>
	{:else if !data.plants.length}
		<section class="card all-done">
			<span class="leaf" aria-hidden="true">🌿</span>
			<p><strong>Nothing needs water today.</strong></p>
		</section>
	{/if}

	{#if rooms.length > 1}
		<div class="filter" role="group" aria-label="Room">
			<button
				class="chip"
				class:on={roomId === null}
				aria-pressed={roomId === null}
				onclick={() => (roomId = null)}>All</button
			>
			{#each rooms as [id, name] (id)}
				<button
					class="chip"
					class:on={roomId === id}
					aria-pressed={roomId === id}
					onclick={() => (roomId = id)}>{name}</button
				>
			{/each}
		</div>
	{/if}

	{#if data.plants.length}
		<div class="grid">
			{#each tiles as s (s[0].id)}
				<PlantTile plants={s} today={data.today} onsplit={() => split.add(kind(s[0]))} />
			{/each}
		</div>
		{#if data.plants.some((p) => p.checked)}
			<p class="muted hint">Tap a tile again to undo.</p>
		{/if}
	{/if}

	{#if days.length}
		<section class="room">
			<h2>Coming up</h2>
			{#each days as d (d.day)}
				<details class="day">
					<summary>
						<span>
							<strong>{d.label}</strong>
							<small>{d.plants.length} {d.plants.length === 1 ? 'plant' : 'plants'}</small>
						</span>
						<span class="peek" aria-hidden="true">
							{#each d.plants.slice(0, 4) as p (p.id)}
								<PlantPhoto photoKey={p.photoKey} size={32} />
							{/each}
						</span>
					</summary>
					<ul class="soon">
						{#each d.plants as p (p.id)}
							<li>
								<a href="/plants/{p.id}">
									<PlantPhoto photoKey={p.photoKey} size={96} />
									<small>{p.name}</small>
								</a>
							</li>
						{/each}
					</ul>
				</details>
			{/each}
		</section>
	{/if}
</main>

{#if form?.done}
	{#key form.done.checkIds[0]}<UndoBar done={form.done} />{/key}
{/if}

<style>
	header {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.welcome,
	.all-done {
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.all-done {
		flex-direction: row;
		align-items: center;
	}
	.leaf {
		font-size: 28px;
	}
	.filter {
		display: flex;
		gap: 8px;
		overflow-x: auto;
		margin: 0 -16px;
		padding: 0 16px;
		scrollbar-width: none;
	}
	.filter .chip {
		flex: none;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 12px;
	}
	.hint {
		text-align: center;
		font-size: 14px;
	}
	.room {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.day {
		background: var(--card);
		border-radius: var(--radius);
		box-shadow: var(--shadow);
	}
	summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 10px 12px;
		min-height: 44px;
		cursor: pointer;
		list-style: none;
	}
	summary::-webkit-details-marker {
		display: none;
	}
	summary > span:first-child {
		display: flex;
		flex-direction: column;
	}
	summary strong {
		font-size: 17px;
	}
	summary small {
		color: var(--muted);
		font-size: 14px;
	}
	.peek {
		display: flex;
	}
	.peek :global(img),
	.peek :global(.none) {
		border-radius: 50%;
		border: 2px solid var(--card);
		margin-left: -10px;
	}
	.soon {
		list-style: none;
		margin: 0;
		padding: 0 12px 12px;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
		gap: 10px;
	}
	.soon a {
		display: flex;
		flex-direction: column;
		gap: 4px;
		text-decoration: none;
	}
	.soon :global(img),
	.soon :global(.none) {
		width: 100% !important;
		height: auto !important;
		aspect-ratio: 1;
	}
	.soon small {
		font-size: 13px;
		line-height: 1.2;
	}
</style>
