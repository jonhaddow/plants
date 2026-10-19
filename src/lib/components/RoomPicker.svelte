<script lang="ts">
	// Existing rooms as chips, plus "New room", which shows a box to name it.
	let {
		rooms,
		selected = null
	}: { rooms: { id: number; name: string }[]; selected?: number | null } = $props();
</script>

<fieldset class="field">
	<legend>Room</legend>
	<div class="chips">
		{#each rooms as r (r.id)}
			<label class="chip">
				<input type="radio" name="room" value={r.id} checked={r.id === selected} />
				{r.name}
			</label>
		{/each}
		<label class="chip">
			<input type="radio" name="room" value="new" checked={!rooms.length} />
			New room
		</label>
	</div>
	<input
		class="new"
		name="newRoom"
		placeholder="e.g. Living room"
		aria-label="New room name"
		autocomplete="off"
	/>
</fieldset>

<style>
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
	/* Only when "New room" is picked. */
	.new {
		display: none;
	}
	fieldset:has(input[value='new']:checked) .new {
		display: block;
	}
</style>
