import type { Transformer } from "@lexical/markdown";

/**
 * The transformer lists, late-bound, for the transformers that convert their
 * own contents (a table cell, a Notion block's body) with the full set.
 *
 * Those transformers are themselves members of the lists, so importing the
 * lists from markdown-transformers made an import cycle. Whichever module of
 * the cycle the bundler evaluated first decided whether it worked: entered
 * through markdown-transformers it did, entered through a member the list
 * literal read TABLE before its module had run, and threw
 * "Cannot access 'TABLE' before initialization" — which in production took
 * down every page that lazily loaded the editor (the English word form).
 *
 * This module imports nothing, so it cannot be part of a cycle. The lists
 * are registered once markdown-transformers has built them, and read only
 * when a conversion runs, long after every module has evaluated.
 */

let cellTransformers: Transformer[] = [];
let documentTransformers: Transformer[] = [];

export function registerMarkdownTransformers(lists: {
  cell: Transformer[];
  document: Transformer[];
}): void {
  cellTransformers = lists.cell;
  documentTransformers = lists.document;
}

/** MARKDOWN_TRANSFORMERS, for converting one table cell. */
export const getMarkdownTransformers = (): Transformer[] => cellTransformers;

/** MARKDOWN_DOCUMENT_TRANSFORMERS, for converting a block's whole body. */
export const getMarkdownDocumentTransformers = (): Transformer[] =>
  documentTransformers;
