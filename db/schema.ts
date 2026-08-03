import { integer, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

export const courseProgress = pgTable("course_progress", {
  userId: text("user_id").notNull(),
  moduleId: integer("module_id").notNull(),
  practiceComplete: integer("practice_complete").notNull().default(0),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [primaryKey({ columns: [table.userId, table.moduleId] })]);

export const assessmentAttempts = pgTable("assessment_attempts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  moduleId: integer("module_id").notNull(),
  score: integer("score").notNull(),
  answers: text("answers").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
