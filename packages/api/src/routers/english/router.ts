import { subDays } from "date-fns";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { EnglishAddSchema, WordUpdateSchema } from "./validators";

const ENGLISH_NOTION_DB_ID = "510342fff59a4474a3e764bf18a842c7";
export const englishRouter = createTRPCRouter({
  notion: {
    list: protectedProcedure.query(async ({ ctx }) => {
      const [info, data] = await Promise.all([
        ctx.notion.databases.retrieve({
          database_id: ENGLISH_NOTION_DB_ID,
        }),
        ctx.notion.databases.query({
          database_id: ENGLISH_NOTION_DB_ID,
        }),
      ]);
      return { info, data };
    }),
    practices: protectedProcedure.query(async ({ ctx }) => {
      return await ctx.notion.databases.query({
        database_id: ENGLISH_NOTION_DB_ID,
        filter: {
          or: [
            // Level 0
            {
              property: "Mastery",
              select: {
                is_empty: true,
              },
            },
            {
              property: "Mastery",
              select: {
                equals: "0",
              },
            },
            // Level 1
            {
              and: [
                {
                  property: "Last studied",
                  date: {
                    after: subDays(new Date(), 1).toISOString(),
                  },
                },
                {
                  property: "Mastery",
                  select: {
                    equals: "1",
                  },
                },
              ],
            },
            // Level 2
            {
              and: [
                {
                  property: "Last studied",
                  date: {
                    after: subDays(new Date(), 3).toISOString(),
                  },
                },
                {
                  property: "Mastery",
                  select: {
                    equals: "2",
                  },
                },
              ],
            },
            // Level 3
            {
              and: [
                {
                  property: "Last studied",
                  date: {
                    after: subDays(new Date(), 7).toISOString(),
                  },
                },
                {
                  property: "Mastery",
                  select: {
                    equals: "3",
                  },
                },
              ],
            },
            // Level 3
            {
              and: [
                {
                  property: "Last studied",
                  date: {
                    after: subDays(new Date(), 30).toISOString(),
                  },
                },
                {
                  property: "Mastery",
                  select: {
                    equals: "3",
                  },
                },
              ],
            },
            // Level 4
            {
              and: [
                {
                  property: "Last studied",
                  date: {
                    after: subDays(new Date(), 90).toISOString(),
                  },
                },
                {
                  property: "Mastery",
                  select: {
                    equals: "4",
                  },
                },
              ],
            },
          ],
        },
      });
    }),
    updateMastery: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          mastery: z.string(),
        }),
      )
      .mutation(async ({ ctx, input: { id, mastery } }) => {
        return ctx.notion.pages.update({
          page_id: id,
          properties: {
            Mastery: {
              select: {
                name: mastery,
              },
            },
          },
        });
      }),
    insert: protectedProcedure
      .input(EnglishAddSchema)
      .mutation(async ({ ctx, input }) => {
        return ctx.notion.pages.create({
          parent: { database_id: ENGLISH_NOTION_DB_ID },
          // properties: properties as CreatePageParameters["properties"],
          properties: {
            ...input,
            // IPA: input.Level,
            // // X: "123",
            //   Z: {
            //   select: {
            //   name: "1",
            //   color: "gray"
            // }
            // },
            // X: {
            //   // type: "title",
            //   title: [{text: {content: "123"}}]
            // },
            // G: {
            // select: {
            //   name: "213",
            //   color
            // }
            // }

            // ...input,
            Mastery: {
              select: {
                name: "1",
              },
            },
          },
        });
        // return ctx.notion.pages.create({
        //   parent: { database_id: ENGLISH_NOTION_DB_ID },
        //   properties: {
        //     "Words/Phrases": {
        //       title: [
        //         {
        //           text: {
        //             content: "",
        //           },
        //         },
        //       ],
        //     },
        //   },
        // });
        // const [info, data] = await Promise.all([
        //   ctx.notion.databases.retrieve({
        //     database_id: ENGLISH_NOTION_DB_ID,
        //   }),
        //   ctx.notion.databases.query({
        //     database_id: ENGLISH_NOTION_DB_ID,
        //   }),
        // ]);
        // return { info, data };
      }),
    update: protectedProcedure
      .input(
        WordUpdateSchema.merge(
          z.object({
            id: z.string(),
          }),
        ),
      )
      .mutation(async ({ ctx, input: { id, ...input } }) => {
        return ctx.notion.pages.update({
          page_id: id,
          properties: input,
        });
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return ctx.notion.pages.update({
          page_id: input.id,
          archived: true,
        });
      }),
  },
});
