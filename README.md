# Plants

Which house plants need water today. One photo and a room per plant; each plant's watering interval learns from two buttons, Watered and Still damp. A push notification each morning lists what's due.

Stack: SvelteKit 3 (Svelte 5) on Cloudflare Workers, Drizzle ORM on Cloudflare D1 (SQLite, EU; photos too), Vitest and Playwright. Set up like the budget app.

## Running locally

```sh
npm install
npm run db:migrate:local
npx wrangler d1 execute plants --local --command "INSERT INTO user (email, name) VALUES ('you@example.com', 'You')"
cp .dev.vars.example .dev.vars
npm run dev    # the login page has dev-only "Sign in as" buttons
```

## Sign-in

Google OAuth, sharing budget's client. Only emails in the `user` table can sign in: `wrangler d1 execute plants --remote --command "INSERT INTO user (email, name) VALUES ('you@example.com', 'You')"`.

## Your data

Everything, photos included, is in the D1 database `plants`: `npx wrangler d1 export plants --remote --output plants.sql`.

## Configuration

Vars in `wrangler.jsonc` (`APP_ORIGIN`, `GOOGLE_CLIENT_ID`, `VAPID_PUBLIC_KEY`). Secrets (`wrangler secret put`): `GOOGLE_CLIENT_SECRET`, `VAPID_PRIVATE_KEY`, `CRON_SECRET` (any long random string; authenticates the morning cron). Locally they go in `.dev.vars`; push stays off unless you fill in a VAPID key pair.

## Deploying

As budget: pushing to `main` deploys through Cloudflare Workers Builds, whose deploy command `npm run deploy:ci` applies migrations first.
