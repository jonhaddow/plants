<script lang="ts">
	import type { PageProps } from './$types';
	import { enhance } from '$app/forms';
	import PhotoInput from '#lib/components/PhotoInput.svelte';
	import RoomPicker from '#lib/components/RoomPicker.svelte';

	let { data, form }: PageProps = $props();
	const p = $derived(data.plant);
	let saving = $state(false);
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
			<input name="species" value={p.species ?? ''} placeholder="e.g. Monstera" />
		</label>
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
	form {
		display: flex;
		flex-direction: column;
		gap: 18px;
	}
</style>
