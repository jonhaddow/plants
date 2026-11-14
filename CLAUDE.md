# Plants

Which house plants need water today, for a two-person household. A PWA at https://plants.app.haddow.me. Each plant has a photo, a room and a watering interval that learns from the two buttons, Watered and Still damp. A push each morning lists what's due.

## Worth knowing

- `watering.ts` is the interval learning (Watered, Still damp): pure and unit tested, keep it that way.
- Photos are base64 in D1's `photo` table, shrunk on the phone before upload, and served to signed-in people only.
- The `classify-plants` skill (`.claude/skills/`) names new plants from their photos.
- Secrets: `GOOGLE_CLIENT_SECRET`, `CRON_SECRET` (authenticates the morning cron), `VAPID_PRIVATE_KEY`.

## Review focus

UK days (BST), the interval maths in `watering.ts`, photos left behind when a plant changes or goes.

- Pages scroll in the layout's `.scroll`, not the window, with the tab bar over it (so iOS can't strand it mid-screen). SvelteKit's scroll handling doesn't apply: the layout keeps scroll positions itself, and tapping the iPhone status bar no longer jumps to the top (tapping the open tab does).
