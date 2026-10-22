# Plants

Which house plants need water today, as a phone web app for a household.

- Each plant has a photo, a room and a watering interval.
- The interval learns from two buttons: **Watered** and **Still damp**.
- A push notification each morning lists what's due.

Stack: SvelteKit (Svelte 5) on Cloudflare Workers, Drizzle ORM on Cloudflare D1 (photos included), Vitest and Playwright.

## Running locally

```sh
npm install
npm run db:migrate:local
npx wrangler d1 execute plants --local --command "INSERT INTO user (email, name) VALUES ('you@example.com', 'You')"
cp .dev.vars.example .dev.vars
npm run dev    # the login page has dev-only "Sign in as" buttons
```

Tests: `npm test` (unit), `npm run test:e2e` (Playwright), `npm run check` (types), `npm run lint`.

## Installing on a phone

Open the app in Safari (iPhone) or Chrome (Android), sign in, then Share → Add to Home Screen. Open it from the home screen and turn on Settings → Notifications for the morning reminder.

## Sign-in

Google OAuth. Only emails in the `user` table can sign in.

## Configuration

Vars in `wrangler.jsonc`: `APP_ORIGIN`, `GOOGLE_CLIENT_ID`, `VAPID_PUBLIC_KEY`.

Secrets (`wrangler secret put`):

- `GOOGLE_CLIENT_SECRET`
- `CRON_SECRET`: any long random string; authenticates the morning cron.
- `VAPID_PRIVATE_KEY`: for push notifications. Locally, push stays off unless `.dev.vars` has a key pair.

## Deploying

Pushing to `main` deploys through Cloudflare Workers Builds, whose deploy command `npm run deploy:ci` applies D1 migrations first. Back up the data with `npx wrangler d1 export plants --remote --output plants.sql`.
