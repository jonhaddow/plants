import { error, json } from '@sveltejs/kit';
import { env } from 'cloudflare:workers';
import { today } from '#lib/dates.ts';
import { pushConfig } from '#lib/server/push-config.ts';
import { remind } from '#lib/server/reminders.ts';
import type { RequestHandler } from './$types';

/** Called by the morning cron (worker/entry.js) with the cron secret. */
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!env.CRON_SECRET || request.headers.get('x-cron-secret') !== env.CRON_SECRET) error(403);
	const cfg = pushConfig();
	if (!cfg) return json({ skipped: 'Notifications not set up' });
	return json(await remind(locals.db, cfg, today()));
};
