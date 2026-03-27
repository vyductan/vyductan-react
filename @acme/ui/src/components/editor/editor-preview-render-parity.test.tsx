import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

Object.assign(globalThis, { React });

import { EditorPreview } from "./editor-preview";
import { EditorRender } from "./editor-render";
import { editorRenderFixtures } from "./render/render-fixtures";
import { richTextSemanticContract } from "./themes/rich-text-semantic-contract";

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

function renderPreviewAndPublish(value: unknown, expectedText: string) {
  const preview = render(
    <EditorPreview autoFocus={false} value={JSON.stringify(value)} placeholder="Preview" />,
  );

  const publish = render(<EditorRender value={value as Parameters<typeof EditorRender>[0]["value"]} />);

  return waitFor(() => {
    expect(preview.container).toHaveTextContent(expectedText);
    expect(publish.container).toHaveTextContent(expectedText);

    return { preview, publish };
  });
}

function getInlineMarkSummary(container: HTMLElement) {
  return {
    boldTexts: Array.from(container.querySelectorAll("strong")).map((node) => node.textContent?.trim()),
    italicTexts: Array.from(container.querySelectorAll("em")).map((node) => node.textContent?.trim()),
    underlinedTexts: Array.from(container.querySelectorAll(`.${cssToken(richTextSemanticContract.text.underline)}, u`)).map((node) => node.textContent?.trim()),
  };
}

function getListSummary(container: HTMLElement) {
  return {
    unorderedListCount: container.querySelectorAll("ul").length,
    orderedListCount: container.querySelectorAll("ol").length,
    itemTexts: Array.from(container.querySelectorAll("li")).map((node) => node.textContent?.replace(/\s+/g, " ").trim()),
  };
}

function getCheckboxSummary(container: HTMLElement) {
  const inputCheckboxes = Array.from(container.querySelectorAll('input[type="checkbox"]')).map((node) => ({
    ariaLabel: node.getAttribute("aria-label"),
    checked: (node as HTMLInputElement).checked,
  }));

  if (inputCheckboxes.length > 0) {
    return inputCheckboxes;
  }

  return Array.from(container.querySelectorAll("[data-check-icon]")).map((iconNode) => {
    const rootNode = iconNode.parentElement;

    return {
      ariaLabel: rootNode?.textContent?.replace(/\s+/g, " ").trim() ?? null,
      checked:
        rootNode?.classList.contains("check-block-checked") === true ||
        rootNode?.getAttribute("data-checked") === "true" ||
        iconNode.getAttribute("data-checked") === "true",
    };
  });
}

function getCodeBlockSummary(container: HTMLElement) {
  const semanticCodeToken = cssToken(richTextSemanticContract.code);
  const inlineCodeToken = cssToken(richTextSemanticContract.text.code);
  const semanticCodeNodes = semanticCodeToken
    ? Array.from(container.querySelectorAll(`.${semanticCodeToken}`))
    : [];
  const inlineCodeNodes = inlineCodeToken
    ? Array.from(container.querySelectorAll(`.${inlineCodeToken}`))
    : [];
  const codeNodes = Array.from(new Set(semanticCodeNodes));

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
    headerTexts: Array.from(container.querySelectorAll("th")).map((node) => node.textContent?.trim()),
    cellTexts: Array.from(container.querySelectorAll("td")).map((node) => node.textContent?.trim()),
  };
}

function cssToken(value: string) {
  return value
    .split(/\s+/)
    .find((token) => !/[\[:]/.test(token));
}

describe("EditorPreview and EditorRender parity", () => {
  test("keeps paragraph inline mark semantics aligned", async () => {
    const { preview, publish } = await renderPreviewAndPublish(
      editorRenderFixtures.formattedText.content,
      "Bold italic underline plain",
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

  test("keeps heading and paragraph block semantics aligned", async () => {
    const fixture = createHeadingAndParagraphFixture();
    const { preview, publish } = await renderPreviewAndPublish(
      fixture,
      "Canonical heading contentCanonical paragraph content.",
    );

    expect(preview.container.querySelector("h2")?.textContent).toBe("Canonical heading content");
    expect(publish.container.querySelector("h2")?.textContent).toBe("Canonical heading content");
    expect(preview.container.querySelectorAll("p")).toHaveLength(1);
    expect(publish.container.querySelectorAll("p")).toHaveLength(1);
  });

  test("keeps nested list semantics aligned", async () => {
    const { preview, publish } = await renderPreviewAndPublish(
      editorRenderFixtures.bulletList.content,
      "First bulletSecond bulletNested bullet",
    );

    expect(getListSummary(preview.container)).toEqual(getListSummary(publish.container));
    expect(preview.container.querySelector("ul ul")).not.toBeNull();
    expect(publish.container.querySelector("ul ul")).not.toBeNull();
  });

  test("keeps link semantics aligned", async () => {
    const { preview, publish } = await renderPreviewAndPublish(
      editorRenderFixtures.link.content,
      "Canonical link",
    );

    const previewLink = preview.container.querySelector('a[href="https://example.com"]');
    const publishLink = publish.container.querySelector('a[href="https://example.com"]');

    expect(previewLink?.textContent).toBe("Canonical link");
    expect(publishLink?.textContent).toBe("Canonical link");
  });

  test("keeps check-block checked state semantics aligned", async () => {
    const { preview, publish } = await renderPreviewAndPublish(
      editorRenderFixtures.checkBlock.content,
      "Unchecked check blockChecked check block",
    );

    const previewSummary = getCheckboxSummary(preview.container);
    const publishSummary = getCheckboxSummary(publish.container);

    expect(previewSummary).toHaveLength(2);
    expect(previewSummary.map((checkbox) => checkbox.checked)).toEqual([false, true]);
    expect(previewSummary).toEqual(publishSummary);
  });

  test("keeps code block semantics aligned", async () => {
    const { preview, publish } = await renderPreviewAndPublish(
      editorRenderFixtures.codeBlock.content,
      "const answer = 42;",
    );

    const previewSummary = getCodeBlockSummary(preview.container);
    const publishSummary = getCodeBlockSummary(publish.container);

    expect(previewSummary.blockCount).toBe(1);
    expect(previewSummary.semanticCodeCount).toBe(1);
    expect(previewSummary.inlineCodeCount).toBe(0);
    expect(previewSummary.codeTagNames).toEqual(["code"]);
    expect(previewSummary.codeTexts).toContain("const answer = 42;");
    expect(previewSummary).toEqual(publishSummary);
  });

  test("keeps table semantics aligned", async () => {
    const { preview, publish } = await renderPreviewAndPublish(
      editorRenderFixtures.table.content,
      "Header AHeader BCell A1Cell B1",
    );

    const previewSummary = getTableSummary(preview.container);
    const publishSummary = getTableSummary(publish.container);

    expect(previewSummary.tableCount).toBe(1);
    expect(previewSummary.headerTexts).toEqual(["Header A", "Header B"]);
    expect(previewSummary.cellTexts).toEqual(["Cell A1", "Cell B1"]);
    expect(previewSummary).toEqual(publishSummary);
  });
});
