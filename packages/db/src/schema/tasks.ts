import { relations, sql } from "drizzle-orm";
import { json, pgEnum, text, timestamp } from "drizzle-orm/pg-core";

import { pgTable } from "..";
import { ProjectsTable } from "./projects";

/*
 * Task
 */
export const TaskStatusEnum = pgEnum("todo_status", [
  "todo",
  "not_started",
  "in_progress",
  "in_review",
  "done",
  "archived",
]);

export const TaskTypeEnum = pgEnum("task_type", [
  "",
  "bug",
  "feat",
  "docs",
  "module",
  "refactor",
]);

export const TasksTable = pgTable("tasks", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  status: TaskStatusEnum("status").default("todo"),
  estimatedStart: timestamp("estimated_start"),
  estimatedEnd: timestamp("estimated_end"),
  description: text("description"),
  content: json("content").$type<string>(),
  completedAt: timestamp("completed_at"),
  type: TaskTypeEnum("type").default(""),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdateFn(() => sql`now()`),

  parentId: text("parent_id"),
  projectId: text("project_id")
    .references(() => ProjectsTable.id, {
      onDelete: "cascade",
    })
    .default("")
    .notNull(),
});

export const TaskRelations = relations(TasksTable, ({ one, many }) => ({
  project: one(ProjectsTable, {
    fields: [TasksTable.projectId],
    references: [ProjectsTable.id],
    relationName: "project",
  }),
  parrent: one(TasksTable, {
    fields: [TasksTable.parentId],
    references: [TasksTable.id],
    relationName: "parent",
  }),
  children: many(TasksTable, { relationName: "parent" }),
}));
