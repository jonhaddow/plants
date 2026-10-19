<script lang="ts">
	import type { PageProps } from './$types';
	import PlantPhoto from '#lib/components/PlantPhoto.svelte';
	import { describeInterval } from '#lib/watering.ts';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Plants</title>
</svelte:head>

<main class="page">
	<header>
		<h1>Plants</h1>
		<a class="btn primary" href="/plants/new">Add plant</a>
	</header>

	{#if !data.rooms.length}
		<p class="muted">No plants yet.</p>
	{/if}

	{#each data.rooms as r (r.id)}
		<section>
			<h2>{r.name}</h2>
			<ul class="grid">
				{#each r.plants as p (p.id)}
					<li>
						<a href="/plants/{p.id}">
							<PlantPhoto photoKey={p.photoKey} size={160} />
							<strong>{p.name}</strong>
							<small class="muted">{describeInterval(p.intervalDays)}</small>
						</a>
					</li>
				{/each}
			</ul>
		</section>
	{/each}
</main>

<style>
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	header .btn {
		min-height: 44px;
	}
	section {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 12px;
	}
	.grid a {
		display: flex;
		flex-direction: column;
		gap: 4px;
		text-decoration: none;
	}
	.grid a :global(img),
	.grid a :global(.none) {
		width: 100% !important;
		height: auto !important;
		aspect-ratio: 1;
	}
	small {
		font-size: 13px;
	}
</style>
