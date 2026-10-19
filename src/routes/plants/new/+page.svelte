<script lang="ts">
	import { enhance } from '$app/forms';
	import PhotoInput from '#lib/components/PhotoInput.svelte';
	import PlantPhoto from '#lib/components/PlantPhoto.svelte';
	import RoomPicker from '#lib/components/RoomPicker.svelte';
	import { INTERVALS } from '#lib/watering.ts';

	let { data, form } = $props();
	let saving = $state(false);
</script>

<svelte:head>
	<title>Add a plant · Plants</title>
</svelte:head>

<main class="page">
	<a class="back" href="/plants">‹ Plants</a>
	<h1>Add a plant</h1>

	{#if data.last}
		<a class="note added" href="/plants/{data.last.id}">
			<PlantPhoto photoKey={data.last.photoKey} size={40} />
			<span>Added <strong>{data.last.name}</strong>. Next one?</span>
		</a>
	{/if}
	{#if form?.error}<p class="error" role="alert">{form.error}</p>{/if}

	<!-- Keyed, so the form starts afresh (photo and all) after each plant. -->
	{#key data.last?.id}
		<form
			method="POST"
			enctype="multipart/form-data"
			use:enhance={() => {
				saving = true;
				return async ({ update }) => {
					await update();
					saving = false;
				};
			}}
		>
			<PhotoInput />
			<RoomPicker rooms={data.rooms} selected={data.last?.roomId ?? null} />
			<label class="field">
				<span>Name <span class="muted">(optional)</span></span>
				<input name="name" placeholder="e.g. Big fern" autocomplete="off" />
			</label>
			<fieldset class="field">
				<legend>Water it</legend>
				<div class="chips">
					{#each INTERVALS as i (i.days)}
						<label class="chip">
							<input type="radio" name="interval" value={i.days} checked={i.days === 7} />
							{i.label}
						</label>
					{/each}
				</div>
				<small class="muted">Not sure? Weekly. It learns from what you tap.</small>
			</fieldset>
			<label class="tick">
				<input type="checkbox" name="wateredToday" checked />
				Watered today
			</label>
			<button class="btn primary" disabled={saving}>{saving ? 'Saving…' : 'Save plant'}</button>
		</form>
	{/key}

	{#if data.last}<a class="btn quiet" href="/">Done</a>{/if}
</main>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 18px;
	}
	fieldset {
		border: 0;
		margin: 0;
		padding: 0;
		gap: 10px;
	}
	legend {
		padding: 0;
		margin-bottom: 6px;
	}
	small {
		font-weight: 400;
	}
	.added {
		display: flex;
		align-items: center;
		gap: 12px;
		text-decoration: none;
	}
	.tick {
		display: flex;
		align-items: center;
		gap: 10px;
		min-height: 44px;
		font-weight: 600;
	}
	.tick input {
		width: 22px;
		height: 22px;
		accent-color: var(--accent);
	}
</style>
