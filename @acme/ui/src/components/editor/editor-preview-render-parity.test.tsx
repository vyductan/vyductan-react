import "@testing-library/jest-dom/vitest";

import * as React from "react";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { EditorPreview } from "./editor-preview";
import { EditorRender } from "./editor-render";
import {
  editorRenderFixtures,
  editorRenderSourceFixtures,
} from "./render/render-fixtures";
import { richTextSemanticContract } from "./themes/rich-text-semantic-contract";

Object.assign(globalThis, { React });

afterEach(() => {
  cleanup();
});

function createHeadingAndParagraphFixture() {
  return {
    root: {
      ...editorRenderFixtures.heading.content.root,
      children: [
        ...editorRenderFixtures.heading.content.root.children,
        ...editorRenderFixtures.paragraph.content.root.children,
      ],
    },
  };
}

type PreviewRenderFormat = "json" | "markdown" | "html";

function normalizeTextContent(value: string | null | undefined) {
  return value?.replaceAll(/\s+/g, " ").trim() ?? "";
}

function compressTextContent(value: string | null | undefined) {
  return normalizeTextContent(value).replaceAll(" ", "");
}

function getPreviewTextContent(container: HTMLElement) {
  return (
    container.querySelector("[data-lexical-editor='true']")?.textContent ??
    container.textContent
  );
}

function getPublishTextContent(container: HTMLElement) {
  return container.firstElementChild?.textContent ?? container.textContent;
}

function renderPreviewAndPublish(
  value: unknown,
  expectedText: string,
  format: PreviewRenderFormat = "json",
) {
  const previewValue =
    format === "json" ? JSON.stringify(value) : String(value);
  const preview = render(
    <EditorPreview
      autoFocus={false}
      format={format}
      value={previewValue}
      placeholder="Preview"
    />,
  );

  const publish = render(
    <EditorRender
      format={format}
      value={value as Parameters<typeof EditorRender>[0]["value"]}
    />,
  );

  return waitFor(() => {
    const normalizedExpectedText = compressTextContent(expectedText);

    expect(
      compressTextContent(getPreviewTextContent(preview.container)),
    ).toContain(normalizedExpectedText);
    expect(
      compressTextContent(getPublishTextContent(publish.container)),
    ).toContain(normalizedExpectedText);

    return { preview, publish };
  });
}

function getInlineMarkSummary(container: HTMLElement) {
  return {
    boldTexts: [...container.querySelectorAll("strong")].map((node) =>
      node.textContent?.trim(),
    ),
    italicTexts: [...container.querySelectorAll("em")].map((node) =>
      node.textContent?.trim(),
    ),
    underlinedTexts: [
      ...container.querySelectorAll(
        `.${cssToken(richTextSemanticContract.text.underline)}, u`,
      ),
    ].map((node) => node.textContent?.trim()),
  };
}

function getListSummary(container: HTMLElement) {
  return {
    unorderedListCount: container.querySelectorAll("ul").length,
    orderedListCount: container.querySelectorAll("ol").length,
    itemTexts: [...container.querySelectorAll("li")]
      .map((node) => {
        const directParagraph =
          node.querySelector<HTMLParagraphElement>(":scope > p");
        const directTextbox = node.querySelector<HTMLElement>(
          ':scope > [data-lexical-text="true"]',
        );
        const directText =
          directParagraph?.textContent ?? directTextbox?.textContent;

        if (!directText && node.querySelector(":scope > ul, :scope > ol")) {
          return null;
        }

        return (
          directText?.replaceAll(/\s+/g, " ").trim() ??
          node.textContent?.replaceAll(/\s+/g, " ").trim() ??
          null
        );
      })
      .filter(Boolean),
  };
}

function getCheckboxSummary(container: HTMLElement) {
  const inputCheckboxes = [
    ...container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'),
  ].map((node) => ({
    ariaLabel: node.getAttribute("aria-label"),
    checked: node.checked,
  }));

  if (inputCheckboxes.length > 0) {
    return inputCheckboxes;
  }

  return [...container.querySelectorAll<HTMLElement>("[data-check-icon]")].map(
    (iconNode) => {
      const rootNode = iconNode.parentElement;

      return {
        ariaLabel:
          rootNode?.textContent?.replaceAll(/\s+/g, " ").trim() ?? null,
        checked:
          rootNode?.classList.contains("check-block-checked") === true ||
          rootNode?.dataset.checked === "true" ||
          iconNode.dataset.checked === "true",
      };
    },
  );
}

function getCodeBlockSummary(container: HTMLElement) {
  const semanticCodeToken = cssToken(richTextSemanticContract.code);
  const inlineCodeToken = cssToken(richTextSemanticContract.text.code);
  const semanticCodeNodes = semanticCodeToken
    ? [...container.querySelectorAll(`.${semanticCodeToken}`)]
    : [];
  const inlineCodeNodes = inlineCodeToken
    ? [...container.querySelectorAll(`.${inlineCodeToken}`)]
    : [];
  const codeNodes = [...new Set(semanticCodeNodes)];

  return {
    blockCount: codeNodes.length,
    semanticCodeCount: semanticCodeNodes.length,
    inlineCodeCount: inlineCodeNodes.length,
    codeTagNames: codeNodes.map((node) => node.tagName.toLowerCase()),
    codeTexts: codeNodes.map((node) => node.textContent?.trim()),
  };
}

function getTableSummary(container: HTMLElement) {
  return {
    tableCount: container.querySelectorAll("table").length,
    rowCount: container.querySelectorAll("tr").length,
    headerTexts: [...container.querySelectorAll("th")].map((node) =>
      node.textContent?.trim(),
    ),
    cellTexts: [...container.querySelectorAll("td")].map((node) =>
      node.textContent?.trim(),
    ),
  };
}

function getBlockquoteSummary(container: HTMLElement) {
  return {
    quoteCount: container.querySelectorAll("blockquote").length,
    quoteTexts: [...container.querySelectorAll("blockquote")].map((node) =>
      node.textContent?.replaceAll(/\s+/g, " ").trim(),
    ),
  };
}

function cssToken(value: string) {
  return value.split(/\s+/).find((token) => !/[[:]/.test(token));
}

describe("EditorPreview and EditorRender parity", () => {
  test("keeps paragraph inline mark semantics aligned", async () => {
    const { preview, publish } = await renderPreviewAndPublish(
      editorRenderFixtures.formattedText.content,
      "Bold italic underline plain",
      "json",
    );

    const previewSummary = getInlineMarkSummary(preview.container);
    const publishSummary = getInlineMarkSummary(publish.container);

    expect(previewSummary.boldTexts).toContain("Bold");
    expect(previewSummary.italicTexts).toContain("italic");
    expect(previewSummary.underlinedTexts).toContain("underline");
    expect(previewSummary).toEqual(publishSummary);
    expect(preview.container.querySelectorAll("p")).toHaveLength(1);
    expect(publish.container.querySelectorAll("p")).toHaveLength(1);
  });

  test("keeps json, markdown, and html paragraph semantics aligned", async () => {
    const json = await renderPreviewAndPublish(
      editorRenderFixtures.paragraph.content,
      "Canonical paragraph content.",
      "json",
    );
    const markdown = await renderPreviewAndPublish(
      editorRenderSourceFixtures.paragraph.markdown,
      "Canonical paragraph content.",
      "markdown",
    );
    const html = await renderPreviewAndPublish(
      editorRenderSourceFixtures.paragraph.html,
      "Canonical paragraph content.",
      "html",
    );

    const jsonSummary = {
      previewParagraphs: json.preview.container.querySelectorAll("p").length,
      publishParagraphs: json.publish.container.querySelectorAll("p").length,
    };
    const markdownSummary = {
      previewParagraphs:
        markdown.preview.container.querySelectorAll("p").length,
      publishParagraphs:
        markdown.publish.container.querySelectorAll("p").length,
    };
    const htmlSummary = {
      previewParagraphs: html.preview.container.querySelectorAll("p").length,
      publishParagraphs: html.publish.container.querySelectorAll("p").length,
    };

    expect(jsonSummary).toEqual(markdownSummary);
    expect(markdownSummary).toEqual(htmlSummary);
  });

  test("keeps json, markdown, and html heading plus paragraph semantics aligned", async () => {
    const jsonFixture = createHeadingAndParagraphFixture();
    const json = await renderPreviewAndPublish(
      jsonFixture,
      "Canonical heading contentCanonical paragraph content.",
      "json",
    );
    const markdown = await renderPreviewAndPublish(
      editorRenderSourceFixtures.headingParagraph.markdown,
      "Canonical heading contentCanonical paragraph content.",
      "markdown",
    );
    const html = await renderPreviewAndPublish(
      editorRenderSourceFixtures.headingParagraph.html,
      "Canonical heading contentCanonical paragraph content.",
      "html",
    );

    for (const rendered of [json, markdown, html]) {
      expect(rendered.preview.container.querySelector("h2")?.textContent).toBe(
        "Canonical heading content",
      );
      expect(rendered.publish.container.querySelector("h2")?.textContent).toBe(
        "Canonical heading content",
      );
      expect(rendered.preview.container.querySelectorAll("p")).toHaveLength(1);
      expect(rendered.publish.container.querySelectorAll("p")).toHaveLength(1);
    }
  });

  test("keeps json, markdown, and html nested list semantics aligned", async () => {
    const json = await renderPreviewAndPublish(
      editorRenderFixtures.bulletList.content,
      "First bulletSecond bulletNested bullet",
      "json",
    );
    const markdown = await renderPreviewAndPublish(
      editorRenderSourceFixtures.bulletList.markdown,
      "First bulletSecond bulletNested bullet",
      "markdown",
    );
    const html = await renderPreviewAndPublish(
      editorRenderSourceFixtures.bulletList.html,
      "First bulletSecond bulletNested bullet",
      "html",
    );

    const jsonSummary = getListSummary(json.publish.container);
    const markdownSummary = getListSummary(markdown.publish.container);
    const htmlSummary = getListSummary(html.publish.container);

    expect(getListSummary(json.preview.container)).toEqual(jsonSummary);
    expect(getListSummary(markdown.preview.container)).toEqual(markdownSummary);
    expect(getListSummary(html.preview.container)).toEqual(htmlSummary);
    expect(jsonSummary).toEqual(markdownSummary);
    expect(markdownSummary).toEqual(htmlSummary);
  });

  test("keeps json, markdown, and html link semantics aligned", async () => {
    const json = await renderPreviewAndPublish(
      editorRenderFixtures.link.content,
      "Canonical link",
      "json",
    );
    const markdown = await renderPreviewAndPublish(
      editorRenderSourceFixtures.link.markdown,
      "Canonical link",
      "markdown",
    );
    const html = await renderPreviewAndPublish(
      editorRenderSourceFixtures.link.html,
      "Canonical link",
      "html",
    );

    for (const rendered of [json, markdown, html]) {
      const previewLink = rendered.preview.container.querySelector(
        'a[href="https://example.com"]',
      );
      const publishLink = rendered.publish.container.querySelector(
        'a[href="https://example.com"]',
      );

      expect(previewLink?.textContent).toBe("Canonical link");
      expect(publishLink?.textContent).toBe("Canonical link");
    }
  });

  test("keeps json and markdown check-block semantics aligned", async () => {
    const json = await renderPreviewAndPublish(
      editorRenderFixtures.checkBlock.content,
      "Unchecked check blockChecked check block",
      "json",
    );
    const markdown = await renderPreviewAndPublish(
      editorRenderSourceFixtures.checkBlock.markdown,
      "Unchecked check blockChecked check block",
      "markdown",
    );

    const jsonSummary = getCheckboxSummary(json.publish.container);
    const markdownSummary = getCheckboxSummary(markdown.publish.container);

    expect(getCheckboxSummary(json.preview.container)).toEqual(jsonSummary);
    expect(getCheckboxSummary(markdown.preview.container)).toEqual(
      markdownSummary,
    );
    expect(jsonSummary).toHaveLength(2);
    expect(jsonSummary.map((checkbox) => checkbox.checked)).toEqual([
      false,
      true,
    ]);
    expect(jsonSummary).toEqual(markdownSummary);
  });

  test("keeps html blockquote semantics aligned", async () => {
    const { preview, publish } = await renderPreviewAndPublish(
      editorRenderSourceFixtures.blockquote.html,
      "Canonical quote content.",
      "html",
    );

    const previewSummary = getBlockquoteSummary(preview.container);
    const publishSummary = getBlockquoteSummary(publish.container);

    expect(previewSummary.quoteCount).toBe(1);
    expect(previewSummary.quoteTexts).toEqual(["Canonical quote content."]);
    expect(previewSummary).toEqual(publishSummary);
  });

  test("keeps multi-paragraph html blockquote semantics aligned", async () => {
    const { preview, publish } = await renderPreviewAndPublish(
      editorRenderSourceFixtures.blockquoteParagraphs.html,
      "First quote paragraph.Second quote paragraph.",
      "html",
    );

    const previewParagraphs = [
      ...preview.container.querySelectorAll("blockquote p"),
    ].map((node) => node.textContent?.trim());
    const publishParagraphs = [
      ...publish.container.querySelectorAll("blockquote p"),
    ].map((node) => node.textContent?.trim());

    expect(previewParagraphs).toEqual([
      "First quote paragraph.",
      "Second quote paragraph.",
    ]);
    expect(publishParagraphs).toEqual(previewParagraphs);
  });

  test("keeps json and html code block semantics aligned", async () => {
    const json = await renderPreviewAndPublish(
      editorRenderFixtures.codeBlock.content,
      "const answer = 42;",
      "json",
    );
    const html = await renderPreviewAndPublish(
      editorRenderSourceFixtures.codeBlock.html,
      "const answer = 42;",
      "html",
    );

    const jsonSummary = getCodeBlockSummary(json.publish.container);
    const htmlSummary = getCodeBlockSummary(html.publish.container);

    expect(getCodeBlockSummary(json.preview.container)).toEqual(jsonSummary);
    expect(getCodeBlockSummary(html.preview.container)).toEqual(htmlSummary);
    expect(jsonSummary.blockCount).toBe(1);
    expect(jsonSummary.semanticCodeCount).toBe(1);
    expect(jsonSummary.inlineCodeCount).toBe(0);
    expect(jsonSummary.codeTagNames).toEqual(["code"]);
    expect(jsonSummary.codeTexts).toContain("const answer = 42;");
    expect(jsonSummary).toEqual(htmlSummary);
  });

  test("keeps json, markdown, and html table semantics aligned", async () => {
    const json = await renderPreviewAndPublish(
      editorRenderFixtures.table.content,
      "Header AHeader BCell A1Cell B1",
      "json",
    );
    const markdown = await renderPreviewAndPublish(
      editorRenderSourceFixtures.table.markdown,
      "Header AHeader BCell A1Cell B1",
      "markdown",
    );
    const html = await renderPreviewAndPublish(
      editorRenderSourceFixtures.table.html,
      "Header AHeader BCell A1Cell B1",
      "html",
    );

    const jsonSummary = getTableSummary(json.publish.container);
    const markdownSummary = getTableSummary(markdown.publish.container);
    const htmlSummary = getTableSummary(html.publish.container);

    expect(getTableSummary(json.preview.container)).toEqual(jsonSummary);
    expect(getTableSummary(markdown.preview.container)).toEqual(
      markdownSummary,
    );
    expect(getTableSummary(html.preview.container)).toEqual(htmlSummary);
    expect(jsonSummary.tableCount).toBe(1);
    expect(jsonSummary.headerTexts).toEqual(["Header A", "Header B"]);
    expect(jsonSummary.cellTexts).toEqual(["Cell A1", "Cell B1"]);
    expect(jsonSummary).toEqual(markdownSummary);
    expect(markdownSummary).toEqual(htmlSummary);
  });
});
