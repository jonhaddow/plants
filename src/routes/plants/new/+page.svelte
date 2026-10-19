<script lang="ts">
	import type { PageProps } from './$types';
	import { deserialize } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { untrack } from 'svelte';
	import { shrinkFile, toJpeg } from '#lib/photo.ts';
	import { INTERVALS } from '#lib/watering.ts';

	// Camera-first adding: the camera stays open and each photo saves a plant
	// to the room picked under the shutter. Name and how often sit behind
	// Details. Without a camera (or permission) the shutter opens the phone's
	// own camera instead.
	let { data }: PageProps = $props();

	let camera = $state<'starting' | 'on' | 'off'>('starting');
	let stream = $state.raw<MediaStream | null>(null);
	let video = $state<HTMLVideoElement>();
	let form = $state<HTMLFormElement>();

	// Starts on the newest room, where adding most likely left off.
	let room = $state<number | 'new'>(untrack(() => data.rooms.at(-1)?.id ?? 'new'));
	let newRoom = $state('');
	let name = $state('');
	let details = $state(false);
	let saving = $state(false);
	let shots = $state(0);
	let added = $state(0);
	let toast = $state<{ text: string; undo?: number } | null>(null);
	let toastTimer: ReturnType<typeof setTimeout>;

	$effect(() => {
		let gone = false;
		let got: MediaStream | null = null;
		if (!navigator.mediaDevices?.getUserMedia) camera = 'off';
		else
			navigator.mediaDevices
				.getUserMedia({
					video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1920 } }
				})
				.then((s) => {
					got = s;
					if (gone) return stop(s);
					stream = s;
					camera = 'on';
				})
				.catch(() => (camera = 'off'));
		return () => {
			gone = true;
			if (got) stop(got);
		};
	});

	$effect(() => {
		if (video && stream) video.srcObject = stream;
	});

	function stop(s: MediaStream) {
		for (const t of s.getTracks()) t.stop();
	}

	function say(text: string, undo?: number) {
		clearTimeout(toastTimer);
		toast = { text, undo };
		toastTimer = setTimeout(() => (toast = null), 5000);
	}

	/** A room is needed before the photo, so nothing's taken in vain. */
	function ready() {
		if (room !== 'new' || newRoom.trim()) return true;
		say('Name the new room first');
		return false;
	}

	async function snap() {
		if (!video || saving || !ready()) return;
		shots++;
		await save(toJpeg(video, video.videoWidth, video.videoHeight));
	}

	async function pick(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (file && ready()) await save(shrinkFile(file));
	}

	async function post(action: string, body: FormData) {
		const res = await fetch(`?/${action}`, {
			method: 'POST',
			body,
			headers: { 'x-sveltekit-action': 'true' }
		});
		return deserialize(await res.text());
	}

	/** Saves a plant with this photo. Saving starts before the photo's ready, so a double tap can't add two. */
	async function save(shrinking: Promise<Blob | null>) {
		saving = true;
		try {
			const photo = await shrinking;
			if (!photo) return;
			const body = new FormData(form);
			body.set('photo', photo, 'plant.jpg');
			const result = await post('add', body);
			if (result.type === 'success') {
				const plant = result.data!.added as { id: number; name: string; roomId: number };
				added++;
				name = '';
				say(`Saved ${plant.name}`, plant.id);
				if (room === 'new') {
					await invalidateAll();
					room = plant.roomId;
					newRoom = '';
				}
			} else
				say(result.type === 'failure' ? String(result.data?.error) : 'That didn’t save; try again');
		} catch {
			say('No connection; try again');
		} finally {
			saving = false;
		}
	}

	async function undo(id: number) {
		toast = null;
		const body = new FormData();
		body.set('id', String(id));
		if ((await post('remove', body)).type !== 'success') return say('That didn’t undo; try again');
		added--;
		await invalidateAll();
	}
</script>

<svelte:head>
	<title>Add plants · Plants</title>
</svelte:head>

<main>
	<div class="viewfinder">
		{#if camera === 'on'}
			<video bind:this={video} autoplay muted playsinline></video>
		{:else if camera === 'off'}
			<p class="nocam">Tap the button to take a photo of a plant. Each one saves as you go.</p>
		{/if}
		{#key shots}<div class="flash" class:go={shots > 0}></div>{/key}
		<div class="top">
			<a href="/plants">‹ Done</a>
			<span class="count">{added ? `${added} added` : 'One photo per plant'}</span>
		</div>
	</div>

	<form bind:this={form} class="dock" onsubmit={(e) => e.preventDefault()}>
		<div class="shutter-row">
			<label class="side">
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.8"
					aria-hidden="true"
				>
					<rect x="4" y="4" width="16" height="16" rx="3" />
					<path d="m4 16 4.5-4.5 3.5 3.5 2.5-2.5L20 18" />
					<circle cx="15.5" cy="8.5" r="1.5" />
				</svg>
				Photos
				<input type="file" accept="image/*" onchange={pick} disabled={saving} />
			</label>
			{#if camera === 'on'}
				<button
					type="button"
					class="shutter"
					aria-label="Take photo"
					onclick={snap}
					disabled={saving}
				></button>
			{:else}
				<label class="shutter" class:off={camera === 'starting'}>
					<span class="sr">Take a photo</span>
					<input
						type="file"
						accept="image/*"
						capture="environment"
						onchange={pick}
						disabled={saving}
					/>
				</label>
			{/if}
			<button type="button" class="side" onclick={() => (details = true)}>Details ›</button>
		</div>

		<fieldset>
			<legend>Room</legend>
			<div class="chips">
				{#each data.rooms as r (r.id)}
					<label class="chip">
						<input type="radio" name="room" value={r.id} bind:group={room} />
						{r.name}
					</label>
				{/each}
				<label class="chip">
					<input type="radio" name="room" value="new" bind:group={room} />
					New room
				</label>
			</div>
			{#if room === 'new'}
				<input
					class="text"
					name="newRoom"
					placeholder="e.g. Living room"
					aria-label="New room name"
					autocomplete="off"
					bind:value={newRoom}
				/>
			{/if}
		</fieldset>

		<div class="sheet" class:on={details} inert={!details}>
			<label class="lbl" for="name">For the next photo</label>
			<input
				id="name"
				class="text"
				name="name"
				placeholder="Name (optional), e.g. Big fern"
				autocomplete="off"
				bind:value={name}
			/>
			<fieldset>
				<legend>Water it</legend>
				<div class="chips">
					{#each INTERVALS as i (i.days)}
						<label class="chip">
							<input type="radio" name="interval" value={i.days} checked={i.days === 7} />
							{i.label}
						</label>
					{/each}
				</div>
				<small>Not sure? Weekly. It learns from what you tap.</small>
			</fieldset>
			<label class="tick">
				<input type="checkbox" name="wateredToday" checked />
				Watered today
			</label>
			<button type="button" class="btn primary" onclick={() => (details = false)}>Done</button>
		</div>
	</form>

	{#if toast}
		<div class="toast" role="status">
			<span>{toast.text}</span>
			{#if toast.undo}
				<button onclick={() => undo(toast!.undo!)}>Undo</button>
			{/if}
		</div>
	{/if}
</main>

<style>
	main {
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		background: #0d0f0d;
		color: #fff;
		color-scheme: dark;
	}
	.viewfinder {
		position: relative;
		flex: 1;
		min-height: 52dvh;
		overflow: hidden;
		background: radial-gradient(circle at 50% 45%, #2c3f2e, #0d0f0d 75%);
	}
	video {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.nocam {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		padding: 32px;
		text-align: center;
		color: #fffb;
		font-size: 17px;
	}
	.flash {
		position: absolute;
		inset: 0;
		background: #fff;
		opacity: 0;
		pointer-events: none;
	}
	.flash.go {
		animation: flash 0.35s ease-out;
	}
	@keyframes flash {
		from {
			opacity: 0.9;
		}
	}
	.top {
		position: absolute;
		top: calc(12px + env(safe-area-inset-top));
		left: 16px;
		right: 16px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-weight: 800;
	}
	.top a {
		min-height: 44px;
		display: flex;
		align-items: center;
		color: #fffd;
		text-decoration: none;
	}
	.count {
		padding: 6px 12px;
		border-radius: 999px;
		background: rgb(0 0 0 / 0.4);
		font-size: 14px;
	}
	.dock {
		width: 100%;
		max-width: 480px;
		margin: 0 auto;
		padding: 16px 16px calc(20px + env(safe-area-inset-bottom));
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.shutter-row {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
	}
	.shutter {
		position: relative;
		width: 76px;
		height: 76px;
		border: 0;
		border-radius: 50%;
		background: #fff;
		box-shadow:
			0 0 0 5px #0d0f0d,
			0 0 0 8px #fff;
		cursor: pointer;
	}
	.shutter:active {
		scale: 0.94;
	}
	.shutter:disabled,
	.shutter.off,
	.shutter:has(input:disabled) {
		opacity: 0.5;
	}
	.side {
		position: relative;
		display: flex;
		align-items: center;
		gap: 6px;
		min-height: 44px;
		border: 0;
		background: none;
		color: #fffc;
		font-size: 14px;
		font-weight: 700;
		cursor: pointer;
	}
	.side svg {
		width: 22px;
		height: 22px;
	}
	button.side {
		justify-self: end;
	}
	label input[type='file'] {
		position: absolute;
		inset: 0;
		opacity: 0;
		cursor: pointer;
	}
	fieldset {
		border: 0;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	legend,
	.lbl {
		padding: 0;
		margin-bottom: 8px;
		font-size: 13px;
		font-weight: 800;
		color: #fff9;
		text-transform: uppercase;
		letter-spacing: 0.6px;
	}
	.chip {
		background: #ffffff1a;
		color: #fff;
	}
	.chip:has(input:checked) {
		background: #6cc98f;
		color: #0d1f14;
	}
	.text {
		min-height: 48px;
		padding: 0 14px;
		border: 0;
		border-radius: 12px;
		background: #ffffff14;
		color: #fff;
		font-size: 17px;
	}
	small {
		color: #fff9;
		font-size: 14px;
	}
	.sheet {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		max-width: 480px;
		margin: 0 auto;
		padding: 20px 16px calc(24px + env(safe-area-inset-bottom));
		display: flex;
		flex-direction: column;
		gap: 14px;
		border-radius: 24px 24px 0 0;
		background: #1a201b;
		box-shadow: 0 -8px 32px rgb(0 0 0 / 0.4);
		transform: translateY(105%);
		transition: transform 0.25s;
	}
	.sheet.on {
		transform: none;
	}
	.sheet .lbl {
		margin: 0;
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
		accent-color: #6cc98f;
	}
	.toast {
		position: fixed;
		left: 50%;
		bottom: calc(24px + env(safe-area-inset-bottom));
		translate: -50% 0;
		width: min(calc(100% - 32px), 448px);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		min-height: 52px;
		padding: 6px 6px 6px 16px;
		border-radius: 26px;
		background: #eef3ec;
		color: #18211b;
		font-weight: 700;
		box-shadow: 0 8px 28px rgb(0 0 0 / 0.4);
		animation: rise 0.2s ease-out;
	}
	.toast span {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.toast button {
		min-height: 40px;
		padding: 0 16px;
		border: 0;
		border-radius: 20px;
		background: #18211b1a;
		font-weight: 800;
		cursor: pointer;
	}
	@keyframes rise {
		from {
			opacity: 0;
			translate: -50% 12px;
		}
	}
</style>
