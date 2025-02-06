import { z } from "zod";

import { and, eq, ilike } from "@acme/db";
import { TasksTable } from "@acme/db/schema";

import {
  countQuery,
  paginationSchema,
  searchSchema,
  withPaginationQuery,
} from "../../_util/query";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { CreateTaskSchema } from "./validators";

export const tasksRouter = createTRPCRouter({
  notion_retrieve: protectedProcedure.query(({ ctx }) => {
    return ctx.notion.databases.retrieve({
      database_id: "23cf9e6f0a454ecabbcd9e267f192772",
    });
  }),
  notion_list: protectedProcedure
    .input(
      searchSchema
        .merge(
          z.object({
            sortBy: z.string(),
            sortOrder: z.enum(["ascending", "descending"]),
          }),
        )
        .merge(
          z.object({
            status: z.array(z.string()),
          }),
        ),
    )
    .query(({ ctx, input }) => {
      return ctx.notion.databases.query({
        database_id: "23cf9e6f0a454ecabbcd9e267f192772",
        filter: {
          and: [
            // {
            //   property: "Task Name",
            //   rich_text: {
            //     contains: input.query ?? "",
            //   },
            // },
            {
              or: input.status.map((x) => ({
                property: "Status",
                status: { equals: x },
              })),
            },
          ],
        },
        sorts: [
          {
            property: input.sortBy,
            direction: input.sortOrder,
          },
        ],
      });
    }),

  all: protectedProcedure
    .input(
      z
        .object({
          projectId: z.string().optional(),
          projectSlug: z.string().optional(),
        })
        .merge(searchSchema)
        .merge(paginationSchema),
    )
    .query(async ({ ctx, input }) => {
      const where = and(
        input.projectId ? eq(TasksTable.projectId, input.projectId) : undefined,
        ilike(TasksTable.name, `%${input.query}%`),
      );

      const [data, count] = await Promise.all([
        ctx.db.query.TasksTable.findMany({
          limit: input.pageSize,
          offset: (input.page - 1) * input.pageSize,
          where,
          with: {
            project: true,
          },
        }),
        countQuery(ctx.db, TasksTable, where),
      ]);
      // return withPagination(ctx.db, schema.tasks, input, where);
      return withPaginationQuery(data, count, input);
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.TasksTable.findFirst({
        where: eq(TasksTable.id, input.id),
      });
    }),

  create: protectedProcedure
    .input(CreateTaskSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(TasksTable).values(input);
    }),

  update: protectedProcedure
    .input(
      CreateTaskSchema.merge(
        z.object({
          id: z.string(),
        }),
      ),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db
        .update(TasksTable)
        .set(input)
        .where(eq(TasksTable.id, input.id));
    }),

  delete: protectedProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.db.delete(TasksTable).where(eq(TasksTable.id, input));
  }),
});
