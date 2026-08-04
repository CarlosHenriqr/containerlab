CREATE TABLE "module_status" (
  "user_id" text NOT NULL,
  "module_id" integer NOT NULL,
  "practice_complete" integer DEFAULT 0 NOT NULL,
  "best_score" integer DEFAULT 0 NOT NULL,
  "passed_at" timestamp with time zone,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "module_status_user_id_module_id_pk" PRIMARY KEY("user_id","module_id")
);
