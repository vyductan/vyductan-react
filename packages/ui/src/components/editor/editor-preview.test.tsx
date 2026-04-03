import "@testing-library/jest-dom/vitest";

import * as React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { EditorPreview } from "./editor-preview";
import * as editorExports from "./index";

Object.assign(globalThis, { React });

const AUTHORED_JSON = JSON.stringify({
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
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "Preview content rendered through the existing editor runtime.",
            type: "text",
            version: 1,
          },
        ],
      },
    ],
  },
});

const EMPTY_JSON = JSON.stringify({
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
        children: [],
      },
    ],
  },
});

const AUTHORED_MARKDOWN =
  "# Markdown preview\n\nRendered through the existing markdown runtime path.";

const AUTHORED_HTML =
  "<h1>HTML preview</h1><p>Rendered through the existing HTML runtime path.</p>";

afterEach(() => {
  cleanup();
});

describe("EditorPreview", () => {
  test("renders authored JSON content through the existing editor runtime", async () => {
    render(
      <EditorPreview
        value={AUTHORED_JSON}
        placeholder="Write, press space for AI"
        autoFocus={false}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          "Preview content rendered through the existing editor runtime.",
        ),
      ).toBeInTheDocument();
    });
  });

  test("renders markdown through the existing runtime path", async () => {
    render(
      <EditorPreview
        format="markdown"
        value={AUTHORED_MARKDOWN}
        placeholder="Write, press space for AI"
        autoFocus={false}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Markdown preview")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Rendered through the existing markdown runtime path.",
        ),
      ).toBeInTheDocument();
    });
  });

  test("renders HTML through the existing runtime path", async () => {
    render(
      <EditorPreview
        format="html"
        value={AUTHORED_HTML}
        placeholder="Write, press space for AI"
        autoFocus={false}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("HTML preview")).toBeInTheDocument();
      expect(
        screen.getByText("Rendered through the existing HTML runtime path."),
      ).toBeInTheDocument();
    });
  });

  test("remains read-only and does not expose authoring behavior", async () => {
    const { container } = render(
      <EditorPreview
        format="markdown"
        value={AUTHORED_MARKDOWN}
        placeholder="Write, press space for AI"
        autoFocus={false}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Markdown preview")).toBeInTheDocument();
    });

    const editorRoot = container.querySelector('[contenteditable="false"]');
    expect(editorRoot).toBeInTheDocument();
    expect(
      container.querySelector('[contenteditable="true"]'),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveAttribute(
      "aria-readonly",
      "true",
    );
    expect(
      screen.queryByText("Write, press space for AI"),
    ).not.toBeInTheDocument();
  });

  test("does not show the authoring placeholder when read-only content is empty", async () => {
    render(
      <EditorPreview
        value={EMPTY_JSON}
        placeholder="Write, press space for AI"
        autoFocus={false}
      />,
    );

    await waitFor(() => {
      expect(
        screen.queryByText("Write, press space for AI"),
      ).not.toBeInTheDocument();
    });
  });

  test("is exported from the editor package entrypoint", () => {
    expect(editorExports.EditorPreview).toBe(EditorPreview);
  });
});
