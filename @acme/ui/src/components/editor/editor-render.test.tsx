import "@testing-library/jest-dom/vitest";

import * as React from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import { JSDOM } from "jsdom";
import { afterEach, describe, expect, test } from "vitest";

import { EditorRender } from "./editor-render";
import * as editorExports from "./index";
import {
  canonicalEditorRenderFixtureNames,
  editorRenderFixtures,
  editorRenderSourceFixtures,
  unsupportedEditorRenderFixtureNames,
} from "./render/render-fixtures";
import { richTextSemanticContract } from "./themes/rich-text-semantic-contract";

Object.assign(globalThis, { React });

afterEach(() => {
  cleanup();
});

describe("EditorRender", () => {
  test("is exported from the editor package entrypoint", () => {
    expect(editorExports.EditorRender).toBe(EditorRender);
  });

  test("renders null for invalid input", () => {
    const invalidJson = render(<EditorRender value="not valid json" />);
    expect(invalidJson.container.firstChild).toBeNull();

    const invalidShape = render(
      <EditorRender value={editorRenderFixtures.invalidShape.serialized} />,
    );
    expect(invalidShape.container.firstChild).toBeNull();
  });

  test("renders a paragraph fixture semantically", () => {
    render(<EditorRender value={editorRenderFixtures.paragraph.serialized} />);

    const paragraphText = screen.getByText("Canonical paragraph content.");
    const paragraph = paragraphText.closest("p");
    expect(paragraph).not.toBeNull();
    expect(paragraph).toHaveClass(richTextSemanticContract.paragraph);
  });

  test("renders a heading fixture semantically", () => {
    render(<EditorRender value={editorRenderFixtures.heading.content} />);

    const heading = screen.getByRole("heading", {
      name: "Canonical heading content",
    });
    expect(heading.tagName).toBe("H2");
    expect(heading).toHaveClass(richTextSemanticContract.heading.h2);
  });

  test("renders quote, links, and autolinks", () => {
    const quoteRender = render(
      <EditorRender value={editorRenderFixtures.quote.content} />,
    );
    const quote = quoteRender.container.querySelector("blockquote");
    expect(quote).not.toBeNull();
    expect(quote).toHaveTextContent("Canonical quote content.");
    expect(quote).toHaveClass(richTextSemanticContract.quote);

    cleanup();

    render(<EditorRender value={editorRenderFixtures.link.serialized} />);
    const link = screen.getByRole("link", { name: "Canonical link" });
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveClass(richTextSemanticContract.link);

    cleanup();

    render(<EditorRender value={editorRenderFixtures.autolink.serialized} />);
    const autolink = screen.getByRole("link", {
      name: "https://example.com/autolink",
    });
    expect(autolink).toHaveAttribute("href", "https://example.com/autolink");
  });

  test("drops unsafe hrefs instead of rendering executable links", () => {
    render(
      <EditorRender
        value={{
          root: {
            type: "root",
            direction: null,
            format: "",
            indent: 0,
            version: 1,
            children: [
              {
                type: "paragraph",
                direction: null,
                format: "",
                indent: 0,
                version: 1,
                children: [
                  {
                    type: "link",
                    url: "javascript:alert(1)",
                    rel: null,
                    target: null,
                    title: null,
                    direction: null,
                    format: "",
                    indent: 0,
                    version: 1,
                    children: [
                      {
                        detail: 0,
                        format: 0,
                        mode: "normal",
                        style: "",
                        text: "Unsafe link",
                        type: "text",
                        version: 1,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        }}
      />,
    );

    expect(
      screen.queryByRole("link", { name: "Unsafe link" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Unsafe link")).toBeInTheDocument();
  });

  test("renders formatted text, inline code, and soft line breaks", () => {
    const formatted = render(
      <EditorRender value={editorRenderFixtures.formattedText.content} />,
    );
    expect(screen.getByText("Bold").tagName).toBe("STRONG");
    expect(formatted.container.querySelector("em")).toHaveTextContent(/italic/);
    expect(formatted.container.querySelector("u")).toHaveTextContent(
      /underline/,
    );

    cleanup();

    render(<EditorRender value={editorRenderFixtures.inlineCode.content} />);
    const inlineCode = screen.getByText("const value = 1");
    expect(inlineCode.tagName).toBe("CODE");
    expect(inlineCode).toHaveClass(richTextSemanticContract.text.code);

    cleanup();

    const softBreak = render(
      <EditorRender value={editorRenderFixtures.softBreak.content} />,
    );
    const paragraph = softBreak.container.querySelector("p");
    expect(paragraph?.querySelector("br")).not.toBeNull();
    expect(paragraph).toHaveTextContent("Line oneLine two");
  });

  test("renders bullet, number, and checklist list semantics including nesting", () => {
    const bullet = render(
      <EditorRender value={editorRenderFixtures.bulletList.content} />,
    );
    const bulletList = bullet.container.querySelector("ul");
    expect(bulletList).not.toBeNull();
    expect(bulletList?.querySelector("ul")).not.toBeNull();
    expect(screen.getByText("Nested bullet")).toBeInTheDocument();

    cleanup();

    const numbered = render(
      <EditorRender value={editorRenderFixtures.numberList.content} />,
    );
    const orderedList = numbered.container.querySelector("ol");
    expect(orderedList).not.toBeNull();
    expect(
      within(orderedList as HTMLElement).getByText("First item"),
    ).toBeInTheDocument();
    expect(
      within(orderedList as HTMLElement).getByText("Second item"),
    ).toBeInTheDocument();

    cleanup();

    const checklist = render(
      <EditorRender value={editorRenderFixtures.checkList.content} />,
    );
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(2);
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).toBeChecked();
    expect(checklist.container.querySelector("ul")).not.toBeNull();
  });

  test("renders custom check-block checked state semantically", () => {
    render(<EditorRender value={editorRenderFixtures.checkBlock.content} />);

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(2);
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).toBeChecked();
    expect(screen.getByText("Unchecked check block")).toBeInTheDocument();
    expect(screen.getByText("Checked check block")).toBeInTheDocument();
  });

  test("keeps semantic checkboxes accessible without rendering an extra visible control", () => {
    const checklist = render(
      <EditorRender value={editorRenderFixtures.checkList.content} />,
    );
    const uncheckedChecklist = screen.getByRole("checkbox", {
      name: "Unchecked checklist item",
    });
    const checkedChecklist = screen.getByRole("checkbox", {
      name: "Checked checklist item",
    });
    expect(uncheckedChecklist).not.toBeChecked();
    expect(checkedChecklist).toBeChecked();
    expect(uncheckedChecklist).toHaveClass("sr-only");
    expect(checkedChecklist).toHaveClass("sr-only");
    expect(
      checklist.container.querySelectorAll("input[type='checkbox']"),
    ).toHaveLength(2);

    cleanup();

    const checkBlock = render(
      <EditorRender value={editorRenderFixtures.checkBlock.content} />,
    );
    const uncheckedCheckBlock = screen.getByRole("checkbox", {
      name: "Unchecked check block",
    });
    const checkedCheckBlock = screen.getByRole("checkbox", {
      name: "Checked check block",
    });
    expect(uncheckedCheckBlock).not.toBeChecked();
    expect(checkedCheckBlock).toBeChecked();
    expect(uncheckedCheckBlock).toHaveClass("sr-only");
    expect(checkedCheckBlock).toHaveClass("sr-only");
    expect(
      checkBlock.container.querySelectorAll("input[type='checkbox']"),
    ).toHaveLength(2);
  });

  test("renders code blocks and horizontal rules", () => {
    const codeBlock = render(
      <EditorRender value={editorRenderFixtures.codeBlock.content} />,
    );
    const code = codeBlock.container.querySelector("pre code");
    expect(code).not.toBeNull();
    expect(code).toHaveTextContent("const answer = 42;");
    expect(code).toHaveClass(richTextSemanticContract.code);

    cleanup();

    const hrRender = render(
      <EditorRender value={editorRenderFixtures.horizontalRule.content} />,
    );
    const hr = hrRender.container.querySelector("hr");
    expect(hr).not.toBeNull();
    expect(hr).toHaveClass(richTextSemanticContract.hr);
  });

  test("renders table structure semantically", () => {
    const { container } = render(
      <EditorRender value={editorRenderFixtures.table.content} />,
    );

    const table = container.querySelector("table");
    const rows = container.querySelectorAll("tr");
    const headerCells = container.querySelectorAll("th");
    const bodyCells = container.querySelectorAll("td");

    expect(table).not.toBeNull();
    expect(rows).toHaveLength(2);
    expect(headerCells).toHaveLength(2);
    expect(bodyCells).toHaveLength(2);
    expect(screen.getByText("Header A")).toBeInTheDocument();
    expect(screen.getByText("Cell B1")).toBeInTheDocument();
  });

  test("renders markdown paragraph input semantically", () => {
    render(
      <EditorRender
        format="markdown"
        value={editorRenderSourceFixtures.paragraph.markdown}
      />,
    );

    const paragraphText = screen.getByText("Canonical paragraph content.");
    const paragraph = paragraphText.closest("p");
    expect(paragraph).not.toBeNull();
    expect(paragraph).toHaveClass(richTextSemanticContract.paragraph);
  });

  test("renders html heading input semantically", () => {
    render(
      <EditorRender
        format="html"
        value={editorRenderSourceFixtures.heading.html}
      />,
    );

    const heading = screen.getByRole("heading", {
      name: "Canonical heading content",
    });
    expect(heading.tagName).toBe("H2");
    expect(heading).toHaveClass(richTextSemanticContract.heading.h2);
  });

  test("renders markdown nested list input semantically", () => {
    const { container } = render(
      <EditorRender
        format="markdown"
        value={editorRenderSourceFixtures.bulletList.markdown}
      />,
    );

    const bulletList = container.querySelector("ul");
    expect(bulletList).not.toBeNull();
    expect(container.querySelector("ul ul")).not.toBeNull();
    expect(screen.getByText("Nested bullet")).toBeInTheDocument();
  });

  test("renders html link input semantically", () => {
    render(
      <EditorRender
        format="html"
        value={editorRenderSourceFixtures.link.html}
      />,
    );

    const link = screen.getByRole("link", { name: "Canonical link" });
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveClass(richTextSemanticContract.link);
  });

  test("renders html blockquote input semantically", () => {
    const { container } = render(
      <EditorRender
        format="html"
        value={editorRenderSourceFixtures.blockquote.html}
      />,
    );

    const quote = container.querySelector("blockquote");
    expect(quote).not.toBeNull();
    expect(quote).toHaveTextContent("Canonical quote content.");
    expect(quote).toHaveClass(richTextSemanticContract.quote);
  });

  test("preserves paragraph structure inside html blockquotes", () => {
    const { container } = render(
      <EditorRender
        format="html"
        value={editorRenderSourceFixtures.blockquoteParagraphs.html}
      />,
    );

    const paragraphs = [...container.querySelectorAll("blockquote p")].map(
      (node) => node.textContent?.trim(),
    );

    expect(paragraphs).toEqual([
      "First quote paragraph.",
      "Second quote paragraph.",
    ]);
  });

  test("renders markdown check-block semantics", () => {
    render(
      <EditorRender
        format="markdown"
        value={editorRenderSourceFixtures.checkBlock.markdown}
      />,
    );

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(2);
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).toBeChecked();
    expect(screen.getByText("Unchecked check block")).toBeInTheDocument();
    expect(screen.getByText("Checked check block")).toBeInTheDocument();
  });

  test("renders html code block input semantically", () => {
    const { container } = render(
      <EditorRender
        format="html"
        value={editorRenderSourceFixtures.codeBlock.html}
      />,
    );

    const code = container.querySelector("pre code");
    expect(code).not.toBeNull();
    expect(code).toHaveTextContent("const answer = 42;");
    expect(code).toHaveClass(richTextSemanticContract.code);
  });

  test("renders markdown table input semantically", () => {
    const { container } = render(
      <EditorRender
        format="markdown"
        value={editorRenderSourceFixtures.table.markdown}
      />,
    );

    const table = container.querySelector("table");
    const rows = container.querySelectorAll("tr");
    const headerCells = container.querySelectorAll("th");
    const bodyCells = container.querySelectorAll("td");

    expect(table).not.toBeNull();
    expect(rows).toHaveLength(2);
    expect(headerCells).toHaveLength(2);
    expect(bodyCells).toHaveLength(2);
    expect(screen.getByText("Header A")).toBeInTheDocument();
    expect(screen.getByText("Cell B1")).toBeInTheDocument();
  });

  test("returns null for object input with markdown format", () => {
    const rendered = render(
      <EditorRender
        value={editorRenderFixtures.paragraph.content}
        format="markdown"
      />,
    );

    expect(rendered.container.firstChild).toBeNull();
  });

  test("returns null for object input with html format", () => {
    const rendered = render(
      <EditorRender
        value={editorRenderFixtures.paragraph.content}
        format="html"
      />,
    );

    expect(rendered.container.firstChild).toBeNull();
  });

  test("returns null for unsupported markdown and html source inputs", () => {
    const markdownImage = render(
      <EditorRender
        format="markdown"
        value={editorRenderSourceFixtures.unsupportedImage.markdown}
      />,
    );
    expect(markdownImage.container.firstChild).toBeNull();

    cleanup();

    const { window } = new JSDOM(
      "<!doctype html><html><body></body></html>",
    ) as unknown as {
      window: Window & typeof globalThis;
    };
    const originalDomParser = globalThis.DOMParser;
    const originalElement = globalThis.Element;
    const originalHtmlElement = globalThis.HTMLElement;
    const originalNode = globalThis.Node;

    Object.assign(globalThis, {
      DOMParser: window.DOMParser,
      Element: window.Element,
      HTMLElement: window.HTMLElement,
      Node: window.Node,
    });

    try {
      const htmlImage = render(
        <EditorRender
          format="html"
          value={editorRenderSourceFixtures.unsupportedImage.html}
        />,
      );
      expect(htmlImage.container.firstChild).toBeNull();
    } finally {
      Object.assign(globalThis, {
        DOMParser: originalDomParser,
        Element: originalElement,
        HTMLElement: originalHtmlElement,
        Node: originalNode,
      });
    }
  });

  test("keeps the approved canonical fixture set covered by this renderer", () => {
    expect(canonicalEditorRenderFixtureNames).toEqual([
      "paragraph",
      "heading",
      "quote",
      "link",
      "autolink",
      "bulletList",
      "numberList",
      "checkList",
      "checkBlock",
      "codeBlock",
      "horizontalRule",
      "table",
      "formattedText",
      "inlineCode",
      "softBreak",
    ]);
  });

  test("renders null for all unsupported fixtures", () => {
    expect(unsupportedEditorRenderFixtureNames.length).toBeGreaterThan(0);

    for (const fixtureName of unsupportedEditorRenderFixtureNames) {
      const rendered = render(
        <EditorRender value={editorRenderFixtures[fixtureName].serialized} />,
      );

      expect(rendered.container.firstChild).toBeNull();
      cleanup();
    }
  });
});
