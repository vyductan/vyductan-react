import "@testing-library/jest-dom/vitest";

import * as React from "react";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { Editor } from "./editor";
import { EditorRender } from "./editor-render";

Object.assign(globalThis, { React });

afterEach(() => {
  cleanup();
});

const STYLED_HTML =
  '<p><span style="color: #eb5757;">colored</span> plain <span style="background-color: #fff3bf;">highlighted</span> <span style="font-size: 20px;">larger</span></p>';

/**
 * Exported html goes through `element.style.cssText`, so the browser's CSSOM
 * rewrites colors into its own notation (`#eb5757` comes back as `rgb(...)`).
 * Reading values through CSSOM on both sides keeps these assertions about the
 * color rather than about how it happens to be spelled.
 */
function readStyledSpans(html: string) {
  const parsed = new DOMParser().parseFromString(html, "text/html");

  return [...parsed.querySelectorAll("span")].map((span) => ({
    text: span.textContent,
    color: span.style.color,
    backgroundColor: span.style.backgroundColor,
    fontSize: span.style.fontSize,
    position: span.style.position,
  }));
}

function asCssColor(value: string) {
  const probe = document.createElement("span");
  probe.style.color = value;
  return probe.style.color;
}

function renderEditorAndCaptureHtml(value: string) {
  let latestHtml = "";

  const result = render(
    <Editor
      autoFocus={false}
      format="html"
      onChange={(htmlString) => {
        latestHtml = htmlString;
      }}
      value={value}
    />,
  );

  return { result, readHtml: () => latestHtml };
}

/**
 * These exercise the shipped components rather than a hand-built Lexical config,
 * because the defect they guard was a missing entry in that config: a harness
 * with its own `initialConfig` would pass while the real editor lost data.
 */
describe("html round trip", () => {
  test("keeps inline text styling when reopening saved html", async () => {
    const { readHtml } = renderEditorAndCaptureHtml(STYLED_HTML);

    await waitFor(() => {
      expect(readHtml()).toContain("colored");
    });

    const spans = readStyledSpans(readHtml());

    expect(spans).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          text: "colored",
          color: asCssColor("#eb5757"),
        }),
        expect.objectContaining({
          text: "highlighted",
          backgroundColor: asCssColor("#fff3bf"),
        }),
        expect.objectContaining({ text: "larger", fontSize: "20px" }),
      ]),
    );
  });

  test("converges instead of eroding across repeated edit sessions", async () => {
    const first = renderEditorAndCaptureHtml(STYLED_HTML);

    await waitFor(() => {
      expect(first.readHtml()).toContain("colored");
    });

    const firstPass = first.readHtml();
    cleanup();

    const second = renderEditorAndCaptureHtml(firstPass);

    await waitFor(() => {
      expect(second.readHtml()).toContain("colored");
    });

    // Asserted explicitly: comparing the two passes alone would pass just as
    // happily if both had already lost the styling.
    expect(readStyledSpans(firstPass)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          text: "colored",
          color: asCssColor("#eb5757"),
        }),
      ]),
    );
    expect(second.readHtml()).toBe(firstPass);
  });

  test("publishes the same styling through EditorRender", async () => {
    // EditorRender reads html through the headless converter, a second import
    // path that has to carry the same styles as the live editor.
    const { container } = render(
      <EditorRender format="html" value={STYLED_HTML} />,
    );

    await waitFor(() => {
      expect(container.textContent).toContain("colored");
    });

    const colored = [...container.querySelectorAll("span")].find(
      (node) => node.textContent === "colored",
    );

    expect(colored).toBeTruthy();
    expect(colored).toHaveStyle({ color: "#eb5757" });
  });

  test("drops styling outside the allowlist on the way in", async () => {
    const { readHtml } = renderEditorAndCaptureHtml(
      '<p><span style="position: fixed; color: #2f9e44;">guarded</span></p>',
    );

    await waitFor(() => {
      expect(readHtml()).toContain("guarded");
    });

    const spans = readStyledSpans(readHtml());

    expect(spans).toEqual([
      expect.objectContaining({
        text: "guarded",
        color: asCssColor("#2f9e44"),
        position: "",
      }),
    ]);
  });
});
