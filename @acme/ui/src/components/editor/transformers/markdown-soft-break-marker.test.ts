import type { LexicalNode } from "lexical";
import { createHeadlessEditor } from "@lexical/headless";
import { $createListItemNode, $createListNode } from "@lexical/list";
import {
  $createLineBreakNode,
  $createParagraphNode,
  $createTextNode,
  $getRoot,
} from "lexical";
import { describe, expect, test } from "vitest";

import type { LexicalEditorContent } from "../types";
import { $createCheckBlockNode } from "../nodes/check-block-node";
import { nodes } from "../nodes/nodes";
import {
  lexicalContentToMarkdown,
  markdownToLexicalContent,
} from "../utils/lexical-converter";

function contentOf(build: () => LexicalNode[]): LexicalEditorContent {
  const editor = createHeadlessEditor({ nodes: nodes as never });
  editor.update(
    () =>
      $getRoot()
        .clear()
        .append(...build()),
    { discrete: true },
  );
  return editor.getEditorState().toJSON() as LexicalEditorContent;
}

/** Each top-level block: its type and its text, line breaks as "\n". */
function blocks(content: LexicalEditorContent) {
  const editor = createHeadlessEditor({ nodes: nodes as never });
  editor.setEditorState(editor.parseEditorState(JSON.stringify(content)));
  return editor.getEditorState().read(() =>
    $getRoot()
      .getChildren()
      .map((node) => [node.getType(), node.getTextContent()]),
  );
}

const lines = (...words: string[]) =>
  words.flatMap((line, index) =>
    index === 0
      ? [$createTextNode(line)]
      : [$createLineBreakNode(), $createTextNode(line)],
  );

/**
 * A line of its own inside a block (Shift+Enter) that starts like a list
 * marker — "- Plan" under a to-do, so ticking it strikes the line too —
 * came back from the file as a list of its own: the line break is written
 * as a new line, and "- " opening a line is a list item in markdown.
 */
describe("a Shift+Enter line that starts like a list marker", () => {
  for (const [name, build] of [
    [
      "under a to-do",
      () =>
        $createCheckBlockNode(false).append(
          ...lines("Guest Manage Booking", "- Plan: visualize the outcome"),
        ),
    ],
    [
      "in a paragraph",
      () =>
        $createParagraphNode().append(...lines("Steps", "1. first", "* star")),
    ],
    [
      "in a list item",
      () =>
        $createListNode("bullet").append(
          $createListItemNode().append(...lines("item", "+ plus", "[ ] box")),
        ),
    ],
    [
      "under a to-do, words only",
      () =>
        $createCheckBlockNode(false).append(...lines("Guest", "Plan words")),
    ],
    [
      "in a list item, words only",
      () =>
        $createListNode("bullet").append(
          $createListItemNode().append(...lines("item", "plain words")),
        ),
    ],
  ] as const) {
    test(`stays a line of its block, ${name}`, () => {
      const content = contentOf(() => [build()]);

      const markdown = lexicalContentToMarkdown(content);

      expect(blocks(markdownToLexicalContent(markdown))).toStrictEqual(
        blocks(content),
      );
    });
  }
});

test("a to-do's own lines end in markdown's line break, escaped if need be", () => {
  const content = contentOf(() => [
    $createCheckBlockNode(false).append(
      ...lines("Guest Manage Booking", "- Plan: visualize", "then more"),
    ),
  ]);

  expect(lexicalContentToMarkdown(content)).toBe(
    "- [ ] Guest Manage Booking\\\n\\- Plan: visualize\\\nthen more",
  );
});
