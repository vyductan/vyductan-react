import { createHeadlessEditor } from "@lexical/headless";
import { $createListItemNode, $createListNode, ListItemNode, ListNode } from "@lexical/list";
import {
  $createHeadingNode,
  $createQuoteNode,
  HeadingNode,
  QuoteNode,
} from "@lexical/rich-text";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
import { describe, expect, test } from "vitest";

import { $resolveBlockType } from "./resolve-block-type";

const domStub = () => ({}) as unknown as HTMLElement;

function makeEditor() {
  return createHeadlessEditor({
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode],
    onError: (error) => {
      throw error;
    },
  });
}

function resolveFor(
  build: () => void,
  getElementByKey: (key: string) => HTMLElement | null = domStub,
): string | null {
  const editor = makeEditor();
  let resolved: string | null = null;
  editor.update(
    () => {
      build();
      const selection = $getRoot().selectEnd();
      resolved = $resolveBlockType(selection, getElementByKey);
    },
    { discrete: true },
  );
  return resolved;
}

describe("$resolveBlockType", () => {
  test("resolves a paragraph", () => {
    const type = resolveFor(() => {
      const p = $createParagraphNode();
      p.append($createTextNode("hello"));
      $getRoot().append(p);
    });
    expect(type).toBe("paragraph");
  });

  test("resolves a heading via its tag", () => {
    const type = resolveFor(() => {
      const h = $createHeadingNode("h2");
      h.append($createTextNode("title"));
      $getRoot().append(h);
    });
    expect(type).toBe("h2");
  });

  test("resolves a quote", () => {
    const type = resolveFor(() => {
      const q = $createQuoteNode();
      q.append($createTextNode("quoted"));
      $getRoot().append(q);
    });
    expect(type).toBe("quote");
  });

  test("resolves a list via its list type", () => {
    const type = resolveFor(() => {
      const list = $createListNode("bullet");
      const item = $createListItemNode();
      item.append($createTextNode("item"));
      list.append(item);
      $getRoot().append(list);
    });
    expect(type).toBe("bullet");
  });

  test("returns null when the element has no DOM yet", () => {
    const type = resolveFor(
      () => {
        const p = $createParagraphNode();
        p.append($createTextNode("hello"));
        $getRoot().append(p);
      },
      () => null,
    );
    expect(type).toBeNull();
  });

  test("returns null for a non-range selection", () => {
    const editor = makeEditor();
    let resolved: string | null = "sentinel";
    editor.update(
      () => {
        resolved = $resolveBlockType(null, domStub);
      },
      { discrete: true },
    );
    expect(resolved).toBeNull();
  });
});
