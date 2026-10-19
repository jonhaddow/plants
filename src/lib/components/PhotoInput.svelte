<script lang="ts">
	import { shrinkFile } from '#lib/photo.ts';

	// A big "Take a photo" button. The phone offers its camera or photo
	// library; the photo is shrunk here before upload.
	let { current = null }: { current?: string | null } = $props();

	let preview = $state<string | null>(null);

	async function shrink(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		if (preview) URL.revokeObjectURL(preview);
		preview = URL.createObjectURL(file);
		const small = await shrinkFile(file);
		if (small === file) return;
		const files = new DataTransfer();
		files.items.add(new File([small], 'plant.jpg', { type: 'image/jpeg' }));
		input.files = files.files;
	}

	const shown = $derived(preview ?? (current ? `/photos/${current}` : null));
</script>

<label class="photo" class:has={shown}>
	{#if shown}
		<img src={shown} alt="The plant" />
		<span class="change">Change photo</span>
	{:else}
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.6"
			aria-hidden="true"
		>
			<path
				d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.5-2h6l1.5 2h2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5Z"
			/>
			<circle cx="12" cy="12.5" r="3.5" />
		</svg>
		<span>Take a photo</span>
	{/if}
	<input type="file" name="photo" accept="image/*" onchange={shrink} />
</label>

<style>
	.photo {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 8px;
		aspect-ratio: 4 / 3;
		border-radius: var(--radius);
		border: 2px dashed var(--field);
		background: var(--card);
		color: var(--muted);
		font-weight: 700;
		overflow: hidden;
		cursor: pointer;
	}
	.photo.has {
		border: 0;
	}
	.photo svg {
		width: 44px;
		height: 44px;
	}
	img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.change {
		position: absolute;
		bottom: 10px;
		right: 10px;
		padding: 6px 12px;
		border-radius: 16px;
		background: rgb(0 0 0 / 0.55);
		color: #fff;
		font-size: 13px;
	}
	input {
		position: absolute;
		inset: 0;
		opacity: 0;
		cursor: pointer;
	}
	.photo:has(input:focus-visible) {
		outline: 2px solid var(--ink);
		outline-offset: 2px;
	}
</style>
