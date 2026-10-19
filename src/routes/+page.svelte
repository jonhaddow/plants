<script lang="ts">
	import type { PageProps } from './$types';
	import PlantPhoto from '#lib/components/PlantPhoto.svelte';
	import PlantTile from '#lib/components/PlantTile.svelte';
	import UndoBar from '#lib/components/UndoBar.svelte';
	import { relativeDay } from '#lib/dates.ts';

	let { data, form }: PageProps = $props();

	const dueCount = $derived(data.plants.filter((p) => !p.checked).length);
	const rooms = $derived([...new Map(data.plants.map((p) => [p.roomId, p.room])).entries()]);
	let roomId = $state<number | null>(null);
	const shown = $derived(
		roomId === null ? data.plants : data.plants.filter((p) => p.roomId === roomId)
	);
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
			{#each shown as p (p.id)}
				<PlantTile plant={p} today={data.today} />
			{/each}
		</div>
		{#if data.plants.some((p) => p.checked)}
			<p class="muted hint">Tap a tile again to undo.</p>
		{/if}
	{/if}

	{#if data.upcoming.length}
		<section class="room">
			<h2>Coming up</h2>
			<ul class="list">
				{#each data.upcoming as p (p.id)}
					<li>
						<a class="who soon" href="/plants/{p.id}">
							<PlantPhoto photoKey={p.photoKey} size={40} />
							<span>
								<strong>{p.name}</strong>
								<small>{p.room}</small>
							</span>
							<small class="when">{relativeDay(p.dueOn, data.today)}</small>
						</a>
					</li>
				{/each}
			</ul>
		</section>
	{/if}
</main>

{#if form?.done}
	{#key form.done.checkId}<UndoBar done={form.done} />{/key}
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
	.who {
		display: flex;
		align-items: center;
		gap: 12px;
		text-decoration: none;
	}
	.who > span {
		display: flex;
		flex-direction: column;
		min-width: 0;
		flex: 1;
	}
	.who strong {
		font-size: 17px;
	}
	.who small {
		color: var(--muted);
		font-size: 14px;
	}
	.soon {
		padding: 10px 12px;
	}
	.when {
		white-space: nowrap;
	}
</style>
