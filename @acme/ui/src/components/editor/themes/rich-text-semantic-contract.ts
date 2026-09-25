import type { EditorThemeClasses } from "lexical";

import { cn } from "@acme/ui/lib/utils";

/** Shared by ticked and unticked to-dos: the item and its box. */
const CHECK_ITEM = cn(
  "relative mx-0 list-none pr-6 pl-[30px] outline-none",
  'before:absolute before:block before:content-[""]',
  "before:top-[calc((1lh_-_1rem)/2)] before:left-[3px] before:size-4",
  "before:rounded-[3px] before:border-[1.5px] before:border-solid",
);

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
  // Sizes are relative to the editor's text, so a heading keeps its
  // proportion whatever size the text is: a note at 16px, a form field at
  // 14px. Each ratio is the old pixel value over 16px — at 16px they come out
  // exactly as before (h1 30px on a 44px line, 32px above) — and a heading's
  // own line and margins are over its own size, since `em` there is the
  // heading's font. Fixed in pixels, a 30px heading sat over 14px text in a
  // small field at more than twice its size.
  heading: {
    h1: "scroll-m-20 text-[1.875em] font-bold tracking-tight leading-[calc(44/30)] mt-[calc(32em/30)] mb-[calc(4em/30)] first:mt-0",
    h2: "scroll-m-20 text-[1.5em] font-semibold tracking-tight leading-[1.5] mt-[1em] mb-[calc(4em/24)] first:mt-0",
    h3: "scroll-m-20 text-[1.25em] font-semibold tracking-tight leading-[1.6] mt-[0.8em] mb-[0.2em] first:mt-0",
    h4: "scroll-m-20 text-[1.125em] font-semibold tracking-tight leading-[calc(28/18)] mt-[calc(12em/18)] mb-[calc(4em/18)] first:mt-0",
    h5: "scroll-m-20 text-[1em] font-semibold tracking-tight leading-[1.5] mt-[0.75em] mb-[0.25em] first:mt-0",
    h6: "scroll-m-20 text-[0.875em] font-semibold tracking-tight leading-[calc(20/14)] mt-[calc(12em/14)] mb-[calc(4em/14)] first:mt-0",
  },
  paragraph: cn("leading-[1.5] my-[0.375em]"),
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
    // Notion's to-do box: 16px, inset 3px from the text column, centred on
    // the first line (`1lh` is the item's own line height, so it holds at any
    // text size), grey until ticked, then filled with the accent and a white
    // tick. The text starts 30px in, clear of the box.
    listitemChecked: cn(
      CHECK_ITEM,
      "line-through",
      "before:border-primary before:bg-primary",
      'after:absolute after:block after:content-[""]',
      "after:top-[calc((1lh_-_1rem)/2_+_4px)] after:left-[9.5px]",
      "after:h-[6px] after:w-[3px] after:rotate-45",
      "after:border-solid after:border-white",
      "after:border-t-0 after:border-r-2 after:border-b-2 after:border-l-0",
    ),
    listitemUnchecked: cn(CHECK_ITEM, "before:border-foreground/70"),
    nested: {
      listitem: "list-none before:hidden after:hidden",
    },
    // A list's marker counts only lists of its own kind above it, not its
    // depth. A bullet under a numbered line is the first level of bullets —
    // a filled dot, as in Notion — and a number under a bullet starts at
    // "1.". A number under a number still goes on 1. → a. → i., so every
    // item has an address of its own ("1.a"), which Notion's "1." twice does
    // not give. Descendant selectors do the counting, in the editor and on a
    // published page alike, and each deeper one outranks the one above.
    //
    // A checklist is a <ul> too, so a bullet under one counts it as a level.
    ol: cn(
      "my-1 ml-6 list-decimal [&>li]:mt-1",
      "[ol_&]:list-[lower-alpha] [ol_ol_&]:list-[lower-roman] [ol_ol_ol_&]:list-decimal",
    ),
    // The marker comes from the rules above, so depth sets only the position.
    olDepth: ["list-outside"],
    ul: cn(
      "my-1 ml-6 list-disc [&>li]:mt-1",
      "[ul_&]:list-[circle] [ul_ul_&]:list-[square] [ul_ul_ul_&]:list-disc",
    ),
    ulDepth: ["list-outside"],
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
