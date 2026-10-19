CREATE TABLE `check` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`plant_id` integer NOT NULL,
	`user_id` integer,
	`kind` text NOT NULL,
	`day` text NOT NULL,
	`at` text NOT NULL,
	`before` text NOT NULL,
	FOREIGN KEY (`plant_id`) REFERENCES `plant`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `check_plant_idx` ON `check` (`plant_id`,`at`);--> statement-breakpoint
CREATE TABLE `photo` (
	`key` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `plant` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`room_id` integer NOT NULL,
	`name` text NOT NULL,
	`species` text,
	`notes` text,
	`photo_key` text,
	`interval_days` integer DEFAULT 7 NOT NULL,
	`due_on` text NOT NULL,
	`last_watered_on` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `room`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `plant_room_idx` ON `plant` (`room_id`);--> statement-breakpoint
CREATE INDEX `plant_due_idx` ON `plant` (`due_on`);--> statement-breakpoint
CREATE TABLE `push_subscription` (
	`endpoint` text PRIMARY KEY NOT NULL,
	`p256dh` text NOT NULL,
	`auth` text NOT NULL,
	`user_id` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `room` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `room_name_unique` ON `room` (`name`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`expires_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `session_user_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);