<script lang="ts">
	import { browser } from '$app/env';
	import { beforeNavigate } from '$app/navigation';
	import { page, updated } from '$app/state';
	// Served with the app (not Google Fonts): no extra connections before text shows.
	import '@fontsource-variable/nunito';
	import font from '@fontsource-variable/nunito/files/nunito-latin-wght-normal.woff2?url';
	import './app.css';

	let { data, children } = $props();

	const path = $derived(page.url.pathname);
	const tabs = $derived([
		{ href: '/', label: 'Today', icon: 'today', active: path === '/' },
		{ href: '/plants', label: 'Plants', icon: 'plants', active: path.startsWith('/plants') },
		{
			href: '/settings',
			label: 'Settings',
			icon: 'settings',
			active: path === '/settings' || path === '/notifications'
		}
	]);

	// A new version was deployed: load it fully on the next tap.
	beforeNavigate(({ willUnload, to }) => {
		if (updated.current && !willUnload && to?.url) location.href = to.url.href;
	});

	// Coming back to the app from the background: if a new version was deployed
	// meanwhile, load it straight away.
	async function reloadIfUpdated() {
		if (document.visibilityState === 'visible' && (await updated.check())) location.reload();
	}

	// Keep the home-screen icon's badge equal to how many plants need water.
	$effect(() => {
		if (!browser || !data.user) return;
		const nav = navigator as Navigator & {
			setAppBadge?(n: number): Promise<void>;
			clearAppBadge?(): Promise<void>;
		};
		const count = data.due;
		(count > 0 ? nav.setAppBadge?.(count) : nav.clearAppBadge?.())?.catch(() => {});
	});
</script>

<svelte:head>
	<link rel="preload" href={font} as="font" type="font/woff2" crossorigin="anonymous" />
</svelte:head>

<svelte:document onvisibilitychange={reloadIfUpdated} />

{@render children()}

<!-- Not over the camera, when adding plants. -->
{#if data.user && path !== '/plants/new'}
	<!-- Each tab's code loads straight away, so the first tap only waits for data. -->
	<nav class="tabs" aria-label="Main" data-sveltekit-preload-code="eager">
		{#each tabs as tab (tab.href)}
			<a href={tab.href} class:active={tab.active} aria-current={tab.active ? 'page' : undefined}>
				<span class="icon">
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						{#if tab.icon === 'today'}
							<!-- A watering can's drop. -->
							<path d="M12 3.5c3 3.6 6 7 6 10.3a6 6 0 0 1-12 0c0-3.3 3-6.7 6-10.3Z" />
						{:else if tab.icon === 'plants'}
							<path
								d="M12 21v-8M12 13c0-4 2.5-7 7-7 0 4.5-3 7-7 7ZM12 15c0-3-2-5.5-6-5.5 0 3.5 2.5 5.5 6 5.5Z"
							/>
						{:else}
							<circle cx="12" cy="12" r="3" />
							<path
								d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4.9a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.5a7 7 0 0 0-2 1.2l-2.4-.9-2 3.4 2 1.6a7 7 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-.9a7 7 0 0 0 2 1.2L10 21h4l.5-2.5a7 7 0 0 0 2-1.2l2.4.9 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z"
							/>
						{/if}
					</svg>
					{#if tab.icon === 'today' && data.due}
						<span class="badge">{data.due > 99 ? '99+' : data.due}</span>
					{/if}
				</span>
				<span class="label">{tab.label}</span>
				{#if tab.icon === 'today' && data.due}
					<span class="sr">, {data.due} need water</span>
				{/if}
			</a>
		{/each}
	</nav>
{/if}

<style>
	/* A floating, frosted pill; the page scrolls under it. */
	nav {
		position: fixed;
		left: 50%;
		bottom: calc(12px + env(safe-area-inset-bottom));
		translate: -50% 0;
		width: min(calc(100% - 32px), 360px);
		height: var(--tabs);
		padding: 6px;
		border-radius: 999px;
		background: color-mix(in srgb, var(--card) 78%, transparent);
		backdrop-filter: blur(20px) saturate(1.6);
		-webkit-backdrop-filter: blur(20px) saturate(1.6);
		border: 1px solid color-mix(in srgb, var(--ink) 8%, transparent);
		box-shadow: 0 8px 28px rgb(0 0 0 / 0.12);
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}
	nav a {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2px;
		border-radius: 999px;
		font-size: 11px;
		font-weight: 700;
		color: var(--muted);
		text-decoration: none;
		transition:
			background-color 0.2s,
			color 0.2s;
	}
	.icon {
		position: relative;
		display: flex;
	}
	.icon svg {
		width: 24px;
		height: 24px;
	}
	nav a.active {
		color: var(--accent);
		background: color-mix(in srgb, var(--accent) 12%, transparent);
	}
	.badge {
		position: absolute;
		top: -5px;
		left: 14px;
		min-width: 18px;
		height: 18px;
		padding: 0 5px;
		border-radius: 9px;
		background: var(--water);
		color: var(--on-water);
		font-size: 11px;
		font-weight: 800;
		line-height: 18px;
		text-align: center;
	}
</style>
