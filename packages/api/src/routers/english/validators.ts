import type { ZodType } from "zod";
import { z } from "zod";

import type { CreatePageParameters } from "../../_libs/notion";
import { NotionSelectSchema } from "../../_libs/notion";

const NotionTitleSchema = z.object({
  title: z.array(
    z.object({
      text: z.object({
        content: z.string(),
      }),
    }),
  ),
});
const NotionRichTextSchema = z.object({
  rich_text: z.array(
    z.object({
      text: z.object({
        content: z.string(),
      }),
    }),
  ),
});

export const EnglishAddSchema = z.object({
  "Words/Phrases": NotionTitleSchema,
  IPA: NotionRichTextSchema,
  English: NotionRichTextSchema,
  Vietnamese: NotionRichTextSchema,
  Examples: NotionRichTextSchema,
  Gram: NotionSelectSchema,
  Level: NotionSelectSchema,

  // English: NotionRichTextSchema.nullish(),
  // Vietnamese: NotionRichTextSchema,
  // Example: NotionRichTextSchema,
  // Gram: NotionSelectSchema.nullish(),
  // Level: NotionSelectSchema.nullish(),
}) satisfies ZodType<CreatePageParameters["properties"]>;

export const WordUpdateSchema = EnglishAddSchema;
