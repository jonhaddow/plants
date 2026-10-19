import { error, json } from '@sveltejs/kit';
import { today } from '#lib/dates.ts';
import { dueCount } from '#lib/server/plants.ts';
import { notify } from '#lib/server/push.ts';
import { pushConfig } from '#lib/server/push-config.ts';
import type { RequestHandler } from './$types';

/** Sends a test notification to the signed-in person's devices. */
export const POST: RequestHandler = async ({ locals }) => {
	const cfg = pushConfig();
	if (!cfg) error(503, 'Notifications aren’t set up on this server');
	const result = await notify(
		locals.db,
		cfg,
		{
			title: 'Notifications are on',
			body: 'Each morning, the plants that need water will show up like this.',
			url: '/',
			badge: await dueCount(locals.db, today()),
			tag: 'test'
		},
		locals.user!.id
	);
	return json(result);
};
