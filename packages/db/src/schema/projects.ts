import { relations, sql } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { TasksTable } from "./tasks";

/*
 * Projects
 */
export const ProjectsTable = pgTable("projects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdateFn(() => sql`now()`),
});

export const ProjectRelations = relations(ProjectsTable, ({ many }) => ({
  tasks: many(TasksTable, { relationName: "project" }),
}));
