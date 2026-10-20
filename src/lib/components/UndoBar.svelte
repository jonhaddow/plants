<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Done } from '#lib/watering.ts';

	// "Watered Fern. Undo", floating above the tabs after a check.
	let { done }: { done: Done } = $props();
</script>

<form class="undo" method="POST" action="?/undo" use:enhance role="status">
	<span
		>{done.kind === 'watered' ? `Watered ${done.name}` : `${done.name}: looking again soon`}</span
	>
	{#each done.checkIds as id (id)}<input type="hidden" name="checkId" value={id} />{/each}
	<button>Undo</button>
</form>

<style>
	.undo {
		position: fixed;
		left: 50%;
		bottom: calc(var(--tabs) + 24px + env(safe-area-inset-bottom));
		translate: -50% 0;
		width: min(calc(100% - 32px), 448px);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 6px 6px 6px 16px;
		border-radius: 24px;
		background: var(--ink);
		color: var(--bg);
		font-weight: 600;
		box-shadow: 0 8px 28px rgb(0 0 0 / 0.18);
		animation: rise 0.2s ease-out;
	}
	span {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	button {
		min-height: 40px;
		padding: 0 16px;
		border: 0;
		border-radius: 20px;
		background: color-mix(in srgb, var(--bg) 18%, transparent);
		color: inherit;
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
