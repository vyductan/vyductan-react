import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

Object.assign(globalThis, { React });

import { EditorPreview } from "./editor-preview";
import * as editorExports from "./index";

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
        screen.getByText("Preview content rendered through the existing editor runtime."),
      ).toBeInTheDocument();
    });
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
      expect(screen.queryByText("Write, press space for AI")).not.toBeInTheDocument();
    });
  });

  test("is exported from the editor package entrypoint", () => {
    expect(editorExports.EditorPreview).toBe(EditorPreview);
  });
});
