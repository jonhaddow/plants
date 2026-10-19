<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Settings · Plants</title>
</svelte:head>

<main class="page">
	<h1>Settings</h1>

	<ul class="list">
		<li><a href="/notifications">Notifications <span class="muted">›</span></a></li>
	</ul>

	<section class="group">
		<h2>Experiments</h2>
		<ul class="list">
			<li>
				<a href="/experiments/mockups.html" data-sveltekit-reload
					>Workflow mockups <span class="muted">›</span></a
				>
			</li>
		</ul>
		<p class="muted">Other ways the app could work, with made-up plants. Nothing is saved.</p>
	</section>

	<section class="group people">
		<h2>Who can sign in</h2>
		<ul class="list">
			{#each data.people as u (u.email)}
				<li>
					<span>{u.name}</span>
					<span class="muted">{u.email}</span>
				</li>
			{/each}
		</ul>
	</section>

	<form method="POST" action="/logout">
		<button class="btn danger">Sign out ({data.user?.name})</button>
	</form>
</main>

<style>
	.list li {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		padding: 14px 16px;
	}
	.list a {
		display: flex;
		justify-content: space-between;
		flex: 1;
		text-decoration: none;
		font-weight: 700;
	}
	.list li:has(a) {
		padding: 0;
	}
	.list li a {
		padding: 14px 16px;
	}
	.group {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.people .muted {
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.group > p {
		margin: 0;
		font-size: 14px;
	}
	form .btn {
		width: 100%;
	}
</style>
