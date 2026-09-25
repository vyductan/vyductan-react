import * as React from "react";
import { render } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";

import { EditorRender } from "./editor-render";

// Heights only exist with real layout.

Object.assign(globalThis, { React });

afterEach(() => document.body.replaceChildren());

const text = (value: string) => ({
  type: "text",
  text: value,
  format: 0,
  detail: 0,
  mode: "normal",
  style: "",
  version: 1,
});

const paragraph = (...children: unknown[]) => ({
  type: "paragraph",
  children,
  direction: "ltr",
  format: "",
  indent: 0,
  version: 1,
  textFormat: 0,
  textStyle: "",
});

/**
 * A blank line in a note is the author's spacing. The editor keeps its
 * height — Lexical writes a <br> into an empty paragraph — but the renderer
 * wrote an empty <p>, which collapses to nothing, so a published note lost
 * every gap its author had left.
 */
test("keeps an empty paragraph one line tall, as the editor does", () => {
  const value = JSON.stringify({
    root: {
      type: "root",
      children: [
        paragraph(text("Above")),
        paragraph(),
        paragraph(text("Below")),
      ],
      direction: "ltr",
      format: "",
      indent: 0,
      version: 1,
    },
  });

  const { container } = render(<EditorRender format="json" value={value} />);
  const [above, empty] = [...container.querySelectorAll("p")];

  const lineHeight = above!.getBoundingClientRect().height;
  expect(lineHeight).toBeGreaterThan(0);
  expect(empty!.getBoundingClientRect().height).toBe(lineHeight);
});
