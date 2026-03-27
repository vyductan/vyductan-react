import type { EditorThemeClasses } from "lexical";

import { cn } from "@acme/ui/lib/utils";

export const richTextSemanticContractKeys = [
  "heading",
  "paragraph",
  "quote",
  "link",
  "list",
  "text",
  "code",
  "codeHighlight",
  "table",
  "tableCell",
  "tableCellHeader",
  "hr",
  "checkBlock",
  "checkBlockIcon",
  "checkBlockChecked",
] as const;

export type RichTextSemanticContractKey =
  (typeof richTextSemanticContractKeys)[number];

export type RichTextSemanticContract = Pick<
  EditorThemeClasses,
  RichTextSemanticContractKey
>;

export const richTextSemanticContract = {
  heading: {
    h1: "scroll-m-20 text-3xl font-bold tracking-tight leading-[44px]",
    h2: "scroll-m-20 text-2xl font-semibold tracking-tight leading-[36px]",
    h3: "scroll-m-20 text-xl font-semibold tracking-tight leading-[32px]",
    h4: "scroll-m-20 text-lg font-semibold tracking-tight leading-[28px]",
    h5: "scroll-m-20 text-base font-semibold tracking-tight leading-[24px]",
    h6: "scroll-m-20 text-sm font-semibold tracking-tight leading-[20px]",
  },
  paragraph: cn("leading-[24px]"),
  quote:
    "border-l-[3px] border-gray-300 pl-3.5 pr-0 my-1 italic text-gray-600",
  link: "text-inherit underline decoration-[rgba(55,53,47,0.4)] underline-offset-2 hover:decoration-[rgba(55,53,47,0.6)] transition-colors",
  list: {
    checklist: "relative !list-none p-0",
    listitem: "mx-0",
    listitemChecked:
      'relative mx-0 px-6 list-none outline-none line-through before:content-[""] before:w-4 before:h-4 before:top-0.5 before:left-0 before:block before:bg-cover before:absolute before:border before:border-primary before:rounded before:bg-primary before:bg-no-repeat after:content-[""] after:border-white after:border-solid after:absolute after:block after:top-[6px] after:w-[3px] after:left-[7px] after:right-[7px] after:h-[6px] after:rotate-45 after:border-r-2 after:border-b-2 after:border-l-0 after:border-t-0',
    listitemUnchecked:
      'relative mx-0 px-6 list-none outline-none before:content-[""] before:w-4 before:h-4 before:top-0.5 before:left-0 before:block before:bg-cover before:absolute before:border before:border-primary before:rounded',
    nested: {
      listitem: "list-none before:hidden after:hidden",
    },
    ol: "my-1 ml-6 list-decimal [&>li]:mt-1",
    olDepth: [
      "list-outside !list-decimal",
      "list-outside !list-[upper-roman]",
      "list-outside !list-[lower-roman]",
      "list-outside !list-[upper-alpha]",
      "list-outside !list-[lower-alpha]",
    ],
    ul: "my-1 ml-6 list-disc [&>li]:mt-1",
    ulDepth: [
      "list-outside !list-disc",
      "list-outside !list-[circle]",
      "list-outside !list-[square]",
    ],
  },
  text: {
    bold: "font-semibold",
    code: "bg-[rgba(247,246,243,1)] text-[#eb5757] px-1 py-0.5 rounded text-[85%] font-mono",
    italic: "italic",
    strikethrough: "line-through",
    subscript: "sub",
    superscript: "sup",
    underline: "underline decoration-[rgba(55,53,47,0.4)] underline-offset-2",
    underlineStrikethrough: "underline line-through",
  },
  code: "RichTextSemanticContract__code",
  codeHighlight: {
    atrule: "RichTextSemanticContract__tokenAttr",
    attr: "RichTextSemanticContract__tokenAttr",
    boolean: "RichTextSemanticContract__tokenProperty",
    builtin: "RichTextSemanticContract__tokenSelector",
    cdata: "RichTextSemanticContract__tokenComment",
    char: "RichTextSemanticContract__tokenSelector",
    class: "RichTextSemanticContract__tokenFunction",
    "class-name": "RichTextSemanticContract__tokenFunction",
    comment: "RichTextSemanticContract__tokenComment",
    constant: "RichTextSemanticContract__tokenProperty",
    deleted: "RichTextSemanticContract__tokenProperty",
    doctype: "RichTextSemanticContract__tokenComment",
    entity: "RichTextSemanticContract__tokenOperator",
    function: "RichTextSemanticContract__tokenFunction",
    important: "RichTextSemanticContract__tokenVariable",
    inserted: "RichTextSemanticContract__tokenSelector",
    keyword: "RichTextSemanticContract__tokenAttr",
    namespace: "RichTextSemanticContract__tokenVariable",
    number: "RichTextSemanticContract__tokenProperty",
    operator: "RichTextSemanticContract__tokenOperator",
    prolog: "RichTextSemanticContract__tokenComment",
    property: "RichTextSemanticContract__tokenProperty",
    punctuation: "RichTextSemanticContract__tokenPunctuation",
    regex: "RichTextSemanticContract__tokenVariable",
    selector: "RichTextSemanticContract__tokenSelector",
    string: "RichTextSemanticContract__tokenSelector",
    symbol: "RichTextSemanticContract__tokenProperty",
    tag: "RichTextSemanticContract__tokenProperty",
    url: "RichTextSemanticContract__tokenOperator",
    variable: "RichTextSemanticContract__tokenVariable",
  },
  table: "RichTextSemanticContract__table w-fit overflow-scroll border-collapse",
  tableCell:
    'RichTextSemanticContract__tableCell w-24 relative border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right',
  tableCellHeader:
    "RichTextSemanticContract__tableCellHeader bg-muted border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right",
  hr: 'border-none my-2 mx-0 after:content-[""] after:block after:h-px after:bg-[rgba(55,53,47,0.09)]',
  checkBlock:
    'flex items-start gap-2 my-1 [&>[data-lexical-text="true"]]:flex-1 [&>[data-lexical-text="true"]]:min-w-0',
  checkBlockIcon: "mt-0.5 size-4 flex-shrink-0 rounded border border-primary",
  checkBlockChecked:
    '[&>[data-lexical-text="true"]]:line-through [&>[data-lexical-text="true"]]:text-muted-foreground [&>[data-check-icon]]:bg-primary [&>[data-check-icon]]:relative [&>[data-check-icon]]:after:content-[""] [&>[data-check-icon]]:after:absolute [&>[data-check-icon]]:after:top-[3px] [&>[data-check-icon]]:after:left-[5.5px] [&>[data-check-icon]]:after:w-[3px] [&>[data-check-icon]]:after:h-[6px] [&>[data-check-icon]]:after:rotate-45 [&>[data-check-icon]]:after:border-r-2 [&>[data-check-icon]]:after:border-b-2 [&>[data-check-icon]]:after:border-white',
} satisfies RichTextSemanticContract;
