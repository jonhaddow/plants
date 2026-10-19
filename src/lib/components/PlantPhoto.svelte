<script lang="ts">
	let { photoKey, size = 56 }: { photoKey: string | null; size?: number } = $props();
</script>

{#if photoKey}
	<img src="/photos/{photoKey}" alt="" width={size} height={size} loading="lazy" />
{:else}
	<span class="none" style="width: {size}px; height: {size}px" aria-hidden="true">
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
			<path
				d="M12 21v-8M12 13c0-4 2.5-7 7-7 0 4.5-3 7-7 7ZM12 15c0-3-2-5.5-6-5.5 0 3.5 2.5 5.5 6 5.5Z"
			/>
		</svg>
	</span>
{/if}

<style>
	img,
	.none {
		display: block;
		flex-shrink: 0;
		border-radius: 14px;
		object-fit: cover;
		background: var(--line);
	}
	.none {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--muted);
	}
	.none svg {
		width: 50%;
		height: 50%;
	}
</style>
