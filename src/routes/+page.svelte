<script lang="ts">
	import CheckButtons from '#lib/components/CheckButtons.svelte';
	import PlantPhoto from '#lib/components/PlantPhoto.svelte';
	import UndoBar from '#lib/components/UndoBar.svelte';
	import { daysBetween, relativeDay } from '#lib/dates.ts';

	let { data, form } = $props();

	const dueCount = $derived(data.due.reduce((n, r) => n + r.plants.length, 0));

	function lateness(dueOn: string) {
		const late = daysBetween(dueOn, data.today);
		if (late === 0) return 'Due today';
		return late === 1 ? '1 day late' : `${late} days late`;
	}
</script>

<svelte:head>
	<title>Today · Plants</title>
</svelte:head>

<main class="page">
	<header>
		<h1>Today</h1>
		{#if dueCount}
			<p class="muted">{dueCount === 1 ? '1 plant needs' : `${dueCount} plants need`} water</p>
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
	{:else if !dueCount}
		<section class="card all-done">
			<span class="leaf" aria-hidden="true">🌿</span>
			<p><strong>Nothing needs water today.</strong></p>
		</section>
	{/if}

	{#each data.due as r (r.id)}
		<section class="room">
			<h2>{r.name}</h2>
			<ul class="list">
				{#each r.plants as p (p.id)}
					<li class="due">
						<a class="who" href="/plants/{p.id}">
							<PlantPhoto photoKey={p.photoKey} />
							<span>
								<strong>{p.name}</strong>
								<small class:over={p.dueOn < data.today}>{lateness(p.dueOn)}</small>
							</span>
						</a>
						<CheckButtons id={p.id} name={p.name} />
					</li>
				{/each}
			</ul>
		</section>
	{/each}

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
	.room {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.due {
		padding: 12px;
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
	.who small.over {
		color: var(--over);
		font-weight: 700;
	}
	.soon {
		padding: 10px 12px;
	}
	.when {
		white-space: nowrap;
	}
</style>
