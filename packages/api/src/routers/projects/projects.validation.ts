import { createInsertSchema } from "drizzle-zod";

import { ProjectsTable } from "@acme/db/schema";

export const CreateProjectSchema = createInsertSchema(ProjectsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
