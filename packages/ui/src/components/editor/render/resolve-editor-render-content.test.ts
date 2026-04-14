/* eslint-disable unicorn/no-null -- Lexical APIs and serialized editor fixtures intentionally use null semantics. */
import { describe, expect, test } from "vitest";

import type { LexicalEditorContent } from "../types";
import { createBrowserHtmlDocument } from "../utils/html-converter";
import {
  resolveEditorRenderContentSync,
  resolveServerHtmlEditorRenderContent,
} from "./resolve-editor-render-content";

const jsonContent: LexicalEditorContent = {
  root: {
    type: "root",
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr",
    children: [
      {
        type: "paragraph",
        format: "",
        indent: 0,
        version: 1,
        direction: null as never,
        children: [
          {
            type: "text",
            text: "Hello world",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
        ],
      } as never,
    ],
  },
};

describe("resolveEditorRenderContentSync", () => {
  test("passes through JSON object input unchanged for format=json", () => {
    expect(resolveEditorRenderContentSync(jsonContent, "json")).toBe(
      jsonContent,
    );
  });

  test("passes through JSON string input unchanged for format=json", () => {
    const serialized = JSON.stringify(jsonContent);

    expect(resolveEditorRenderContentSync(serialized, "json")).toBe(serialized);
  });

  test("resolves markdown string input to Lexical JSON for format=markdown", () => {
    const result = resolveEditorRenderContentSync("# Hello world", "markdown");

    expect(result).not.toBeNull();
    expect(result).toMatchObject({
      root: {
        type: "root",
        children: [
          {
            type: "heading",
            tag: "h1",
          },
        ],
      },
    });
  });

  test("resolves HTML string input synchronously through DOMParser when available", () => {
    const result = resolveEditorRenderContentSync("<p>Hello world</p>", "html");

    expect(result).not.toBeNull();
    expect(result).toMatchObject({
      root: {
        type: "root",
        children: [
          {
            type: "paragraph",
          },
        ],
      },
    });
  });

  test("returns null for object input with format=markdown", () => {
    expect(resolveEditorRenderContentSync(jsonContent, "markdown")).toBeNull();
  });

  test("returns null for object input with format=html", () => {
    expect(resolveEditorRenderContentSync(jsonContent, "html")).toBeNull();
  });
});

describe("resolveServerHtmlEditorRenderContent", () => {
  test("returns Lexical JSON when the injected async document factory succeeds", async () => {
    const result = await resolveServerHtmlEditorRenderContent(
      "<p>Hello server</p>",
      {
        createDocument: async (html) => createBrowserHtmlDocument(html),
      },
    );

    expect(result).not.toBeNull();
    expect(result).toMatchObject({
      root: {
        type: "root",
        children: [
          {
            type: "paragraph",
          },
        ],
      },
    });
  });

  test("returns null when the injected document factory throws", async () => {
    const result = await resolveServerHtmlEditorRenderContent("<p>Broken</p>", {
      createDocument: async () => {
        throw new Error("boom");
      },
    });

    expect(result).toBeNull();
  });
});
