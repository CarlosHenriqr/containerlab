CREATE TABLE "assessment_attempts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"module_id" integer NOT NULL,
	"score" integer NOT NULL,
	"answers" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_progress" (
	"user_id" text NOT NULL,
	"module_id" integer NOT NULL,
	"practice_complete" integer DEFAULT 0 NOT NULL,
	"completed_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_progress_user_id_module_id_pk" PRIMARY KEY("user_id","module_id")
);
