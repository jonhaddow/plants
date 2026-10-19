ALTER TABLE `plant` ADD `needs_setup` integer DEFAULT true NOT NULL;--> statement-breakpoint
-- Plants already there were set up by hand (October 2026).
UPDATE `plant` SET `needs_setup` = false;
