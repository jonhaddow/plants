# Decisions

- **Setup is one photo and a room per plant** (October 2026): the reason there's no app in use is the time other apps take to set up. No species needed: every plant starts weekly (or a rough "every few days / fortnightly / monthly") and learns from there. After saving, the form stays open with the room still picked, for walking round the house.
- **The interval learns from two buttons**, not a care database. Still damp: the interval grows to at least how long it's been plus a bit, and the plant comes back in a quarter of the interval (1 to 7 days). Watered before it was due: the interval moves halfway to the actual gap. Watered late teaches nothing (a busy week, not the plant). 1 to 60 days.
- **No AI in the app** (October 2026): no paid API calls. Identifying species, if wanted, is a batch job: Claude Code (Jon's subscription) looks at the photos and fills in `species`, `notes` and starting intervals. Pl@ntNet's free API is the option if it's ever wanted in the app.
- **Undo after every tap**: each check stores the schedule before it, so a mis-tap on a phone puts the plant back exactly.
- **Photos shrunk on the phone** (1200px JPEG, about 200 KB) before upload, and kept in D1 as base64 (`photo` table), served only to signed-in people, with a new key per photo so they cache for good. Not R2: it needs turning on with a card, and the Cloudflare token has no R2 access. A house of plants is a few tens of MB against D1's 5 GB. Move to R2 if photos ever get big or many.
- **One morning push to everyone**, about 8am UK (7:07 UTC cron: 8:07 in summer, 7:07 in winter), naming plants room by room. Nothing if nothing's due. Shared, not per person: either of you can do the watering.
- **Its own look**: Nunito, sage and cream, leaf green for actions and a water blue for Watered. Budget's floating tab bar.
- **Follows the device's light or dark setting**; no theme setting.
- **Rooms are made while adding plants**; no rooms page yet (see roadmap).
- **Experiments are public static files** (October 2026): clickable mockups in `static/experiments`, linked from Settings, with made-up plants. Static assets skip the sign-in check, which is fine with no real data in them.
