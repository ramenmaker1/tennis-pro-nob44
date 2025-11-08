CREATE TABLE `matches` (
	`id` text PRIMARY KEY NOT NULL,
	`player_a_id` text NOT NULL,
	`player_b_id` text NOT NULL,
	`tournament` text,
	`round` text,
	`surface` text,
	`start_time_utc` text NOT NULL,
	`best_of` integer DEFAULT 3 NOT NULL,
	`status` text DEFAULT 'scheduled' NOT NULL,
	FOREIGN KEY (`player_a_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`player_b_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` text PRIMARY KEY NOT NULL,
	`canonical_name` text NOT NULL,
	`slug` text NOT NULL,
	`rank` integer,
	`elo` integer,
	`hard_elo` integer,
	`clay_elo` integer,
	`grass_elo` integer,
	`hand` text,
	`age` integer,
	`nationality` text,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `players_slug_unique` ON `players` (`slug`);--> statement-breakpoint
CREATE TABLE `predictions` (
	`id` text PRIMARY KEY NOT NULL,
	`match_id` text NOT NULL,
	`model_version` text NOT NULL,
	`win_prob_a` real NOT NULL,
	`win_prob_b` real NOT NULL,
	`deuce_tendency` real,
	`pressure_index` real,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sources` (
	`id` text PRIMARY KEY NOT NULL,
	`match_id` text NOT NULL,
	`provider` text NOT NULL,
	`url` text,
	`fetched_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE cascade
);
