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

	<section class="people">
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
	.people {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.people .muted {
		overflow: hidden;
		text-overflow: ellipsis;
	}
	form .btn {
		width: 100%;
	}
</style>
