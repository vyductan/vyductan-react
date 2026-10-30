import type { ListType } from "@lexical/list";
import type { LexicalNode } from "lexical";
import { createHeadlessEditor } from "@lexical/headless";
import { $createListItemNode, $createListNode } from "@lexical/list";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $setState,
} from "lexical";
import { describe, expect, test } from "vitest";

import type { LexicalEditorContent } from "../types";
import { $createCheckBlockNode } from "../nodes/check-block-node";
import { nodes } from "../nodes/nodes";
import {
  lexicalContentToMarkdown,
  markdownToLexicalContent,
} from "../utils/lexical-converter";
import { unmarkedState } from "../utils/list-marker";

/** A document built by `build`, as the editor would save it. */
function contentOf(build: () => LexicalNode[]): LexicalEditorContent {
  const editor = createHeadlessEditor({ nodes: nodes as never });
  editor.update(
    () =>
      $getRoot()
        .clear()
        .append(...build()),
    {
      discrete: true,
    },
  );
  return editor.getEditorState().toJSON() as LexicalEditorContent;
}

const item = (text: string) =>
  $createListItemNode().append($createTextNode(text));

/** An item without its marker, as Backspace at its start leaves it. */
const unmarked = (text: string) => {
  const node = $createListItemNode();
  if (text) node.append($createTextNode(text));
  $setState(node, unmarkedState, true);
  return node;
};

const list = (type: ListType, ...items: LexicalNode[]) =>
  $createListNode(type).append(...(items as never[]));

const nested = (type: ListType, ...items: LexicalNode[]) =>
  $createListItemNode().append(list(type, ...items));

const todo = (text: string, indent = 0) =>
  $createCheckBlockNode(false).append($createTextNode(text)).setIndent(indent);

const text = (words: string, indent = 0) => {
  const node = $createParagraphNode().setIndent(indent);
  if (words) node.append($createTextNode(words));
  return node;
};

interface JsonNode {
  type?: string;
  text?: string;
  indent?: number;
  children?: JsonNode[];
}

const textOf = (node: JsonNode): string =>
  node.text ?? (node.children ?? []).map((child) => textOf(child)).join("");

/** The top-level blocks read back from `markdown`: "type:text@indent". */
const blocks = (markdown: string) =>
  ((markdownToLexicalContent(markdown).root as JsonNode).children ?? []).map(
    (node) => `${node.type}:${textOf(node)}@${node.indent ?? 0}`,
  );

/**
 * Backspace at the start of a to-do drops its checkbox and leaves its words
 * where they were, as text. Saved, the checkbox came back: the line was
 * written as a to-do again.
 */
describe("a to-do's checkbox taken off stays off across a save", () => {
  test("a nested to-do turned to text is written under the to-do above", () => {
    const markdown = lexicalContentToMarkdown(
      contentOf(() => [
        list("check", item("a"), nested("check", unmarked("text")), item("b")),
      ]),
    );

    expect(markdown).toBe("- [ ] a\n\ttext\n- [ ] b");
    expect(blocks(markdown)).toStrictEqual([
      "check-block:a@0",
      "paragraph:text@1",
      "check-block:b@0",
    ]);
  });

  test("an empty one is left out, the to-dos around it kept together", () => {
    // Lexical drops empty lines read from markdown, so it could not come
    // back; written, it split the checklist in two.
    expect(
      lexicalContentToMarkdown(
        contentOf(() => [
          list("check", item("a"), nested("check", unmarked("")), item("b")),
        ]),
      ),
    ).toBe("- [ ] a\n- [ ] b");
    expect(
      lexicalContentToMarkdown(
        contentOf(() => [todo("a"), text("", 1), todo("b")]),
      ),
    ).toBe("- [ ] a\n- [ ] b");
  });

  test("text under a to-do, as a file read back has it, round-trips", () => {
    const content = contentOf(() => [todo("a"), text("text", 1), todo("b")]);
    const markdown = lexicalContentToMarkdown(content);

    expect(markdown).toBe("- [ ] a\n\ttext\n- [ ] b");
    expect(blocks(markdown)).toStrictEqual([
      "check-block:a@0",
      "paragraph:text@1",
      "check-block:b@0",
    ]);
  });

  test("as format on save writes it, it reads back the same", () => {
    // Prettier lines the text up with the to-do's words and nests with two
    // spaces.
    expect(blocks("- [ ] a\n      text\n  - [ ] y\n- [ ] b\n")).toStrictEqual([
      "check-block:a@0",
      "paragraph:text@1",
      "check-block:y@1",
      "check-block:b@0",
    ]);
  });

  test("text at the margin after a to-do is a plain line, as before", () => {
    expect(blocks("- [ ] a\ntext\n")).toStrictEqual([
      "check-block:a@0",
      "paragraph:text@0",
    ]);
  });
});

/** The same for a bullet or a number: its marker does not come back. */
describe("a list item's marker taken off stays off across a save", () => {
  test("a bullet is written as words under the item above", () => {
    expect(
      lexicalContentToMarkdown(
        contentOf(() => [
          list("bullet", item("a"), unmarked("more"), item("b")),
        ]),
      ),
    ).toBe("- a\n  more\n- b");
  });

  test("a number takes no number, and the next item keeps counting", () => {
    expect(
      lexicalContentToMarkdown(
        contentOf(() => [
          list("number", item("one"), unmarked("more"), item("two")),
        ]),
      ),
    ).toBe("1. one\n   more\n2. two");
  });
});
