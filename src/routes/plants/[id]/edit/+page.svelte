<script lang="ts">
	import type { PageProps } from './$types';
	import { enhance } from '$app/forms';
	import PhotoInput from '#lib/components/PhotoInput.svelte';
	import RoomPicker from '#lib/components/RoomPicker.svelte';

	let { data, form }: PageProps = $props();
	const p = $derived(data.plant);
	let saving = $state(false);
	// Phones barely show <datalist> suggestions, so species in use are chips:
	// ones sharing the typed genus first, then A to Z.
	let species = $derived(data.plant.species ?? '');
	const genus = $derived(species.trim().split(' ')[0].toLowerCase());
	const suggested = $derived(
		data.species.toSorted(
			(a, b) =>
				Number(b.toLowerCase().startsWith(genus)) - Number(a.toLowerCase().startsWith(genus))
		)
	);
</script>

<svelte:head>
	<title>Edit {p.name} · Plants</title>
</svelte:head>

<main class="page">
	<a class="back" href="/plants/{p.id}">‹ {p.name}</a>
	<h1>Edit</h1>

	{#if form?.error}<p class="error" role="alert">{form.error}</p>{/if}

	<form
		method="POST"
		enctype="multipart/form-data"
		use:enhance={() => {
			saving = true;
			return async ({ update }) => {
				await update({ reset: false });
				saving = false;
			};
		}}
	>
		<PhotoInput current={p.photoKey} />
		<label class="field">
			Name
			<input name="name" value={p.name} autocomplete="off" />
		</label>
		<RoomPicker rooms={data.rooms} selected={p.roomId} />
		<label class="field">
			Water every (days)
			<input
				name="interval"
				type="number"
				inputmode="numeric"
				min="1"
				max="60"
				value={p.intervalDays}
				required
			/>
		</label>
		<label class="field">
			<span>What it is <span class="muted">(optional)</span></span>
			<input name="species" bind:value={species} placeholder="e.g. Monstera" autocomplete="off" />
		</label>
		{#if suggested.length}
			<div class="suggest" role="group" aria-label="Species in use">
				{#each suggested as s (s)}
					<button
						type="button"
						class="chip"
						class:on={s === species.trim()}
						aria-pressed={s === species.trim()}
						onclick={() => (species = s)}>{s}</button
					>
				{/each}
			</div>
		{/if}
		<label class="field">
			<span>Notes <span class="muted">(optional)</span></span>
			<textarea name="notes" placeholder="Likes a mist; keep out of direct sun"
				>{p.notes ?? ''}</textarea
			>
		</label>
		<button class="btn primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
	</form>
</main>

<style>
	.suggest {
		display: flex;
		gap: 8px;
		overflow-x: auto;
		margin: -8px -16px 0;
		padding: 0 16px;
		scrollbar-width: none;
	}
	.suggest .chip {
		flex: none;
	}
	form {
		display: flex;
		flex-direction: column;
		gap: 18px;
	}
</style>
