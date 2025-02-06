import { z } from "zod";

import { eq, ilike } from "@acme/db";
import { ProjectsTable } from "@acme/db/schema";

import {
  paginationSchema,
  searchSchema,
  withPagination,
} from "../../_util/query";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { CreateProjectSchema } from "./projects.validation";

export const projectsRouter = createTRPCRouter({
  notion_list: protectedProcedure
    .input(searchSchema)
    .query(({ ctx, input }) => {
      return ctx.notion.databases.query({
        database_id: "fc753c295eef4fd4a36ec02266ed9f57",
        filter: {
          and: [
            {
              property: "Project Name",
              rich_text: {
                contains: input.query ?? "",
              },
            },
          ],
        },
      });
    }),

  all: protectedProcedure
    .input(searchSchema.merge(paginationSchema))
    .query(({ ctx, input }) => {
      const where = ilike(ProjectsTable.name, `%${input.query}%`);
      return withPagination(ctx.db, ProjectsTable, input, where);

      // return ctx.db.query.projects.findMany({
      //   orderBy: desc(schema.projects.createdAt),
      //   where: (t, h) => h.ilike(t.name, `%${input.query}%`),
      //   ...withPagination({ page: input.page, pageSize: input.pageSize }),
      // });
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.ProjectsTable.findFirst({
        where: eq(ProjectsTable.id, input.id),
      });
    }),
  bySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.ProjectsTable.findFirst({
        where: eq(ProjectsTable.slug, input.slug),
      });
    }),

  create: protectedProcedure
    .input(CreateProjectSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(ProjectsTable).values(input);
    }),

  update: protectedProcedure
    .input(
      CreateProjectSchema.merge(
        z.object({
          id: z.string(),
        }),
      ),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db
        .update(ProjectsTable)
        .set(input)
        .where(eq(ProjectsTable.id, input.id));
    }),

  delete: protectedProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.db.delete(ProjectsTable).where(eq(ProjectsTable.id, input));
  }),
});
