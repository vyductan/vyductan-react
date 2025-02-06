import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { ExampleTable } from "@acme/db/schema";

export const CreateExampleSchema = createInsertSchema(ExampleTable, {
  title: z.string().max(256),
  content: z.string().max(256),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
