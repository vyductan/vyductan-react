import type {
  RichTextItemResponse,
  SelectPropertyItemObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type { ZodType } from "zod";
import { z } from "zod";

export * from "@notionhq/client/build/src/api-endpoints";

type StringRequest = string;
type SelectColor =
  | "default"
  | "gray"
  | "brown"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "pink"
  | "red";

// type PropertyBase<TType = "title"> = {
//   id: string;
//   type: TType;
// };
// export type NotionPageTitle = PropertyBase<"title"> & {
//   title: RichTextItemResponse[];
// };

const NotionTitleSchema = z.object({
  title: z.array(
    z.object({
      text: z.object({
        content: z.string(),
      }),
      plain_text: z.string(),
    }),
  ),
  name: z.string().nullish(),
});
type NotionTitle = z.infer<typeof NotionTitleSchema>;

const NotionRichTextSchema = z.object({
  rich_text: z.array(
    z.object({
      text: z.object({
        content: z.string(),
      }),
      plain_text: z.string(),
    }),
  ),
});
// export type NotionRichText = z.infer<typeof NotionRichTextSchema>;
type NotionRichText = {
  rich_text: RichTextItemResponse[];
};

export type NotionSelectColor = NonNullable<
  SelectPropertyItemObjectResponse["select"]
>["color"];
// type SelectColor = ;

type NotionSelect = {
  select:
    | {
        id: StringRequest;
        name?: StringRequest;
        color?: SelectColor;
        description?: StringRequest | null;
      }
    | null
    | {
        name: StringRequest;
        id?: StringRequest;
        color?: SelectColor;
        description?: StringRequest | null;
      };
  type?: "select";
};
const NotionSelectSchema = z.object({
  select: z
    .object({
      name: z.string(),
      color: z
        .enum([
          "default",
          "gray",
          "brown",
          "orange",
          "yellow",
          "green",
          "blue",
          "purple",
          "pink",
          "red",
        ])
        .optional(),
    })
    .nullable(),
}) satisfies ZodType<NotionSelect>;
// export type NotionSelect = z.infer<typeof NotionSelectSchema>;

export { NotionTitleSchema, NotionRichTextSchema, NotionSelectSchema };

export type { NotionSelect, NotionRichText, NotionTitle };
