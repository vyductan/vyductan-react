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
  // Block spacing, after Notion. Every block used to sit flush against the
  // next: two paragraphs read as one with a line break in it, and a heading was
  // as close to the text before it as to its own, so it marked no break.
  //
  // A heading gets room above, scaled with its size, and stays close to what
  // it introduces; vertical margins collapse, so the larger of two neighbours'
  // margins is the gap. `first:mt-0` keeps a note that opens with a heading
  // from starting lower on the page.
  heading: {
    h1: "scroll-m-20 text-3xl font-bold tracking-tight leading-[44px] mt-8 mb-1 first:mt-0",
    h2: "scroll-m-20 text-2xl font-semibold tracking-tight leading-[36px] mt-6 mb-1 first:mt-0",
    h3: "scroll-m-20 text-xl font-semibold tracking-tight leading-[32px] mt-4 mb-1 first:mt-0",
    h4: "scroll-m-20 text-lg font-semibold tracking-tight leading-[28px] mt-3 mb-1 first:mt-0",
    h5: "scroll-m-20 text-base font-semibold tracking-tight leading-[24px] mt-3 mb-1 first:mt-0",
    h6: "scroll-m-20 text-sm font-semibold tracking-tight leading-[20px] mt-3 mb-1 first:mt-0",
  },
  paragraph: cn("leading-[24px] my-1.5"),
  // A quote is someone's words, not an aside: it reads in the same voice as
  // the text around it, with the rule down its left the only thing marking it.
  // Greying and italicising it made pasted quotes look like disclaimers.
  quote: "border-l-[3px] border-current pl-3.5 pr-0 my-1",
  // No color and no decoration color: the link takes both from whatever page it
  // lands on. Published content has to look native in its host, and the host is
  // the only thing that knows its own link color.
  // A link inserted through "Paste as -> Mention" carries rel="mention" and
  // reads as a pill rather than as underlined text. It is expressed here, as
  // utilities on the link class, rather than in the stylesheet: this contract is
  // the one thing the editor theme and the published renderer share, so both
  // surfaces pick the pill up from a single place — and utilities outrank the
  // stylesheet's `@layer components`, which could not have turned the underline
  // off from there.
  //
  // The underline is the text's own color at 40%, 1px thick, and full
  // strength on hover: faint enough that a linked address — or a code chip
  // inside a link — is marked rather than struck through with a black rule,
  // which is how Notion draws it. A fraction of `currentColor` is still no
  // color of the link's own.
  link: cn(
    "text-inherit underline underline-offset-4",
    "decoration-1 decoration-current/40 hover:decoration-current",
    "[&[rel~=mention]]:no-underline [&[rel~=mention]]:rounded-sm",
    "[&[rel~=mention]]:bg-muted [&[rel~=mention]]:px-1 [&[rel~=mention]]:py-0.5",
  ),
  list: {
    // A top-level checklist drops the `ml-6` every list gets: that margin is
    // the label column, and the box draws inside the item's own padding —
    // so with it the box sat where list TEXT starts and the text a column
    // further in. Nested checklists keep it; it is their indent.
    checklist: "relative list-none! p-0 [:not(li)>&]:ml-0!",
    listitem: "mx-0",
    listitemChecked:
      'relative mx-0 px-6 list-none outline-none line-through before:content-[""] before:w-4 before:h-4 before:top-0.5 before:left-0 before:block before:bg-cover before:absolute before:border before:border-primary before:rounded before:bg-primary before:bg-no-repeat after:content-[""] after:border-white after:border-solid after:absolute after:block after:top-[6px] after:w-[3px] after:left-[7px] after:right-[7px] after:h-[6px] after:rotate-45 after:border-r-2 after:border-b-2 after:border-l-0 after:border-t-0',
    listitemUnchecked:
      'relative mx-0 px-6 list-none outline-none before:content-[""] before:w-4 before:h-4 before:top-0.5 before:left-0 before:block before:bg-cover before:absolute before:border before:border-primary before:rounded',
    nested: {
      listitem: "list-none before:hidden after:hidden",
    },
    ol: "my-1 ml-6 list-decimal [&>li]:mt-1",
    // Notion's levels: 1. → a. → i., then round again. Lexical and the
    // published renderer both take depth modulo this length.
    olDepth: [
      "list-outside list-decimal!",
      "list-outside list-[lower-alpha]!",
      "list-outside list-[lower-roman]!",
    ],
    ul: "my-1 ml-6 list-disc [&>li]:mt-1",
    ulDepth: [
      "list-outside list-disc!",
      "list-outside list-[circle]!",
      "list-outside list-[square]!",
    ],
  },
  text: {
    bold: "font-semibold",
    // The muted fill alone left `<html>` too close to the prose around it to
    // pick out at a glance. The color comes from the stylesheet, next to the
    // syntax palette and for the same reason: a host has no token for "this is
    // code" to lend.
    code: cn(
      "bg-muted px-1 py-0.5 rounded text-[85%] font-mono",
      "RichTextSemanticContract__inlineCode",
    ),
    italic: "italic",
    strikethrough: "line-through",
    subscript: "sub",
    superscript: "sup",
    underline: "underline underline-offset-4",
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
  // A cell's paragraphs take no block spacing: it is for running text, and in a
  // cell it only makes every row taller.
  // No width on the cell: until someone drags a column, what it holds decides
  // how wide it is (see the table rules in themes/editor-theme.css). A fixed
  // `w-24` gave every column 96px regardless, and a list of providers wrapped
  // one word per line beside a nearly empty first column.
  table:
    "RichTextSemanticContract__table w-fit max-w-full overflow-scroll border-collapse",
  tableCell:
    "RichTextSemanticContract__tableCell relative border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right [&>p]:my-0",
  tableCellHeader:
    "RichTextSemanticContract__tableCellHeader bg-muted border px-4 py-2 text-left font-bold [[align=center]]:text-center [[align=right]]:text-right [&>p]:my-0",
  hr: 'border-none my-2 mx-0 after:content-[""] after:block after:h-px after:bg-border',
  checkBlock:
    'flex items-start gap-2 my-1 *:data-[lexical-text="true"]:flex-1 *:data-[lexical-text="true"]:min-w-0',
  checkBlockIcon: "mt-0.5 size-4 shrink-0 rounded border border-primary",
  checkBlockChecked:
    '*:data-[lexical-text="true"]:line-through *:data-[lexical-text="true"]:text-muted-foreground *:data-check-icon:bg-primary *:data-check-icon:relative *:data-check-icon:after:content-[""] *:data-check-icon:after:absolute *:data-check-icon:after:top-[3px] *:data-check-icon:after:left-[5.5px] *:data-check-icon:after:w-[3px] *:data-check-icon:after:h-[6px] *:data-check-icon:after:rotate-45 *:data-check-icon:after:border-r-2 *:data-check-icon:after:border-b-2 *:data-check-icon:after:border-white',
} satisfies RichTextSemanticContract;
