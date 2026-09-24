import { describe, expect, test } from "vitest";

import { MARKDOWN_TRANSFORMERS } from "../transformers/markdown-transformers";
import {
  EMPTY_LEXICAL_EDITOR_CONTENT,
  lexicalContentToMarkdown,
  markdownToLexicalContent,
  tryMarkdownToLexicalContent,
} from "./lexical-converter";

describe("tryMarkdownToLexicalContent", () => {
  test("returns a valid empty root for empty markdown", () => {
    expect(tryMarkdownToLexicalContent("")).toEqual(
      EMPTY_LEXICAL_EDITOR_CONTENT,
    );
  });

  test("returns lexical JSON with a root node for headings", () => {
    expect(tryMarkdownToLexicalContent("## Heading")).toMatchObject({
      root: {
        type: "root",
      },
    });
  });

  test("returns null when the injected editor factory throws", () => {
    expect(
      tryMarkdownToLexicalContent("## Heading", {
        createEditor: () => {
          throw new Error("boom");
        },
      }),
    ).toBeNull();
  });

  test("returns null when the editor reports a runtime error through onError", () => {
    expect(
      tryMarkdownToLexicalContent("## Heading", {
        createEditor: (config) =>
          ({
            update: () => {
              if (!config?.onError) {
                throw new Error("missing onError");
              }

              config.onError(new Error("runtime boom"));
            },
            getEditorState: () => ({
              toJSON: () => EMPTY_LEXICAL_EDITOR_CONTENT,
            }),
          }) as never,
      }),
    ).toBeNull();
  });
});

describe("markdownToLexicalContent", () => {
  test("preserves empty-root fallback when the injected editor factory throws", () => {
    expect(
      markdownToLexicalContent("## Heading", {
        createEditor: () => {
          throw new Error("boom");
        },
      }),
    ).toEqual(EMPTY_LEXICAL_EDITOR_CONTENT);
  });
});

/**
 * A code block has to survive the trip to markdown and back. The shared
 * transformer list leaves the multiline ones out so that typing ``` does not
 * turn a sentence into a code block — but converting a document is not typing,
 * and without them a code block exported as bare lines and came back as
 * paragraphs.
 */
describe("code blocks", () => {
  const markdown = ["Before", "", "```js", "const x = 1;", "```", ""].join(
    "\n",
  );

  test("import as a code block", () => {
    const content = markdownToLexicalContent(markdown);
    const types = content.root.children.map((child) => child.type);

    expect(types).toContain("code");
  });

  test("export with their fence and language", () => {
    const exported = lexicalContentToMarkdown(
      markdownToLexicalContent(markdown),
    );

    expect(exported).toContain("```js");
    expect(exported).toContain("const x = 1;");
    expect(exported.match(/```/g)).toHaveLength(2);
  });

  test("stay out of the list that drives typing shortcuts", () => {
    // Typing ``` mid-sentence must not turn the line into a code block; only
    // whole-document conversion gets the multiline transformers.
    expect(
      MARKDOWN_TRANSFORMERS.some(
        (transformer) => transformer.type === "multiline-element",
      ),
    ).toBe(false);
  });
});
