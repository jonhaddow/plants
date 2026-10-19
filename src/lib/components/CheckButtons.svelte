<script lang="ts">
	import { enhance } from '$app/forms';

	// Watered / Still damp for one plant. The page's actions are water and damp
	// (see check-actions.ts).
	let { id, name }: { id: number; name: string } = $props();
</script>

<form
	method="POST"
	class="buttons"
	use:enhance={() =>
		({ update }) =>
			update({ reset: false })}
>
	<input type="hidden" name="id" value={id} />
	<button class="btn water" formaction="?/water" aria-label="Watered {name}">Watered</button>
	<button class="btn quiet" formaction="?/damp" aria-label="{name} is still damp">Still damp</button
	>
</form>

<style>
	.buttons {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 8px;
	}
	.btn {
		min-height: 44px;
		padding: 0 12px;
	}
	.water {
		background: var(--water);
		border-color: var(--water);
		color: var(--on-water);
	}
</style>
