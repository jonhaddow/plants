# Plants

Which house plants need water today, as a phone web app for a household.

Each plant has a photo, a room and a watering interval. The interval learns from two buttons, **Watered** and **Still damp**, and a push notification each morning lists what's due.

## Tech stack

- [SvelteKit](https://svelte.dev) (Svelte 5) and TypeScript, as an installable PWA
- [Cloudflare Workers](https://workers.cloudflare.com), with [D1](https://developers.cloudflare.com/d1/) (SQLite) through [Drizzle ORM](https://orm.drizzle.team), photos included
- Google sign-in ([Arctic](https://arcticjs.dev)) for an allowlist of users
- [Tailwind CSS](https://tailwindcss.com) and [shadcn-svelte](https://shadcn-svelte.com)
- Web push notifications from a daily cron trigger
- [Vitest](https://vitest.dev) and [Playwright](https://playwright.dev) for tests
- Deployed from `main` by Cloudflare Workers Builds

## Development

See [`docs/development.md`](docs/development.md) for running it locally, configuration and deploying.
