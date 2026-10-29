import { describe, expect, test } from "vitest";

import {
  lexicalContentToMarkdown,
  markdownToLexicalContent,
} from "../utils/lexical-converter";

interface JsonNode {
  type?: string;
  text?: string;
  src?: string;
  altText?: string;
  showCaption?: boolean;
  caption?: { editorState?: { root?: JsonNode } };
  children?: JsonNode[];
}

const textOf = (node: JsonNode | undefined): string =>
  node?.text ?? (node?.children ?? []).map((child) => textOf(child)).join("");

const findImage = (node: JsonNode | undefined): JsonNode | undefined => {
  if (!node) return undefined;
  if (node.type === "image") return node;
  for (const child of node.children ?? []) {
    const found = findImage(child);
    if (found) return found;
  }
  return undefined;
};

const imageOf = (markdown: string) => {
  const image = findImage(markdownToLexicalContent(markdown).root as JsonNode);
  return {
    src: image?.src,
    altText: image?.altText,
    showCaption: image?.showCaption,
    caption: textOf(image?.caption?.editorState?.root),
  };
};

const roundTrip = (markdown: string) =>
  lexicalContentToMarkdown(markdownToLexicalContent(markdown));

/**
 * Markdown has one place for words that go with an image: its title,
 * `![alt](src "title")`. A caption is kept there, so it lasts a save.
 */
describe("IMAGE markdown transformer: captions", () => {
  test("reads a title as the image's caption", () => {
    expect(imageOf('![pic](assets/a.png "Nice shot")')).toStrictEqual({
      src: "assets/a.png",
      altText: "pic",
      showCaption: true,
      caption: "Nice shot",
    });
  });

  test("an image without a title has no caption", () => {
    expect(imageOf("![pic](assets/a.png)")).toStrictEqual({
      src: "assets/a.png",
      altText: "pic",
      showCaption: false,
      caption: "",
    });
  });

  test("round-trips a caption, quotes and all", () => {
    const markdown = String.raw`![pic](assets/a.png "Say \"hi\"")`;
    expect(imageOf(markdown).caption).toBe('Say "hi"');
    expect(roundTrip(markdown)).toBe(markdown);
  });

  test("writes an image without a caption as it was", () => {
    expect(roundTrip("![pic](assets/a.png)")).toBe("![pic](assets/a.png)");
  });
});
