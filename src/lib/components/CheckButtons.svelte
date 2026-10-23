<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.ts';
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
	<Button variant="water" size="sm" formaction="?/water" aria-label="Watered {name}">Watered</Button
	>
	<Button variant="secondary" size="sm" formaction="?/damp" aria-label="{name} is still damp"
		>Still damp</Button
	>
</form>

<style>
	.buttons {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 8px;
	}
</style>
