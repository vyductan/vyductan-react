import { describe, expect, test } from "vitest";

import {
  EMPTY_LEXICAL_EDITOR_CONTENT,
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
