import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { desc, eq } from "@acme/db";
import { ExampleTable } from "@acme/db/schema";

import { protectedProcedure, publicProcedure } from "../../trpc";
import { CreateExampleSchema } from "./validators";

export const _exampleRouter = {
  all: publicProcedure.query(({ ctx }) => {
    // return ctx.db.select().from(schema.post).orderBy(desc(schema.post.id));
    return ctx.db.query.ExampleTable.findMany({
      orderBy: desc(ExampleTable.id),
      limit: 10,
    });
  }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      // return ctx.db
      //   .select()
      //   .from(schema.post)
      //   .where(eq(schema.post.id, input.id));

      return ctx.db.query.ExampleTable.findFirst({
        where: eq(ExampleTable.id, input.id),
      });
    }),

  create: protectedProcedure
    .input(CreateExampleSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(ExampleTable).values(input);
    }),

  delete: protectedProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.db.delete(ExampleTable).where(eq(ExampleTable.id, input));
  }),
} satisfies TRPCRouterRecord;
