CREATE TABLE "matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_a_id" uuid NOT NULL,
	"player_b_id" uuid NOT NULL,
	"tournament" text,
	"round" text,
	"surface" text,
	"start_time_utc" timestamp with time zone NOT NULL,
	"best_of" integer DEFAULT 3 NOT NULL,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"canonical_name" text NOT NULL,
	"display_name" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"slug" text NOT NULL,
	"rank" integer,
	"peak_rank" integer,
	"elo" integer,
	"hard_elo" integer,
	"clay_elo" integer,
	"grass_elo" integer,
	"plays" text,
	"hand" text,
	"photo_url" text,
	"birth_year" integer,
	"height_cm" integer,
	"first_serve_pct" integer,
	"first_serve_win_pct" integer,
	"second_serve_win_pct" integer,
	"aces_per_match" numeric(6, 2),
	"double_faults_per_match" numeric(6, 2),
	"first_return_win_pct" integer,
	"second_return_win_pct" integer,
	"break_points_converted_pct" integer,
	"return_games_won_pct" integer,
	"clutch_factor" integer,
	"consistency_rating" integer,
	"tiebreak_win_pct" integer,
	"deuce_win_pct" integer,
	"hard_court_win_pct" integer,
	"clay_court_win_pct" integer,
	"grass_court_win_pct" integer,
	"fitness_rating" integer,
	"momentum_rating" numeric(5, 2),
	"data_source" text,
	"nationality" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "players_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "predictions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"match_id" uuid NOT NULL,
	"model_version" text NOT NULL,
	"model_type" text NOT NULL,
	"win_prob_a" numeric(6, 5) NOT NULL,
	"win_prob_b" numeric(6, 5) NOT NULL,
	"confidence_level" text,
	"deuce_tendency" numeric(6, 5),
	"pressure_index" numeric(6, 5),
	"predicted_winner_id" uuid,
	"actual_winner_id" uuid,
	"was_correct" boolean,
	"completed_at" timestamp with time zone,
	"notes" text,
	"metadata" text,
	"point_by_point_data" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"match_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"url" text,
	"fetched_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_player_a_id_players_id_fk" FOREIGN KEY ("player_a_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_player_b_id_players_id_fk" FOREIGN KEY ("player_b_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sources" ADD CONSTRAINT "sources_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;