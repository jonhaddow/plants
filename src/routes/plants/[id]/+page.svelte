<script lang="ts">
	import CheckButtons from '#lib/components/CheckButtons.svelte';
	import PlantPhoto from '#lib/components/PlantPhoto.svelte';
	import UndoBar from '#lib/components/UndoBar.svelte';
	import { relativeDay } from '#lib/dates.ts';
	import { describeInterval } from '#lib/watering.ts';

	let { data, form } = $props();
	const p = $derived(data.plant);
	let deleting = $state(false);
</script>

<svelte:head>
	<title>{p.name} · Plants</title>
</svelte:head>

<main class="page">
	<div class="top">
		<a class="back" href="/plants">‹ Plants</a>
		<a class="back" href="/plants/{p.id}/edit">Edit</a>
	</div>

	<div class="hero"><PlantPhoto photoKey={p.photoKey} size={480} /></div>

	<header>
		<h1>{p.name}</h1>
		<p class="muted">{p.room}{p.species ? ` · ${p.species}` : ''}</p>
	</header>

	<section class="card when">
		<p>
			<strong class:over={p.dueOn < data.today}>
				{p.dueOn <= data.today ? 'Needs water' : `Next: ${relativeDay(p.dueOn, data.today)}`}
			</strong>
			<span class="muted">
				· {describeInterval(p.intervalDays)}{p.lastWateredOn
					? ` · last watered ${relativeDay(p.lastWateredOn, data.today).toLowerCase()}`
					: ''}
			</span>
		</p>
		<CheckButtons id={p.id} name={p.name} />
		<small class="muted">Dry before it’s due? Tap Watered anyway: it’ll come round sooner.</small>
	</section>

	{#if p.notes}
		<section class="card notes"><p>{p.notes}</p></section>
	{/if}

	{#if data.checks.length}
		<section class="history">
			<h2>History</h2>
			<ul class="list">
				{#each data.checks as c (c.id)}
					<li>
						<span>{c.kind === 'watered' ? '💧 Watered' : '🤚 Still damp'}</span>
						<span class="muted">{relativeDay(c.day, data.today)}{c.who ? ` · ${c.who}` : ''}</span>
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	<form method="POST" action="?/delete">
		{#if deleting}
			<button class="btn danger">Yes, delete {p.name}</button>
		{:else}
			<button class="btn danger" type="button" onclick={() => (deleting = true)}
				>Delete plant</button
			>
		{/if}
	</form>
</main>

{#if form?.done}
	{#key form.done.checkId}<UndoBar done={form.done} />{/key}
{/if}

<style>
	.top {
		display: flex;
		justify-content: space-between;
	}
	.hero :global(img),
	.hero :global(.none) {
		width: 100% !important;
		height: auto !important;
		aspect-ratio: 4 / 3;
		border-radius: var(--radius);
	}
	header {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.when,
	.notes {
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.notes p {
		white-space: pre-line;
	}
	.history {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.history li {
		display: flex;
		justify-content: space-between;
		padding: 12px 16px;
	}
	form .btn {
		width: 100%;
	}
</style>
