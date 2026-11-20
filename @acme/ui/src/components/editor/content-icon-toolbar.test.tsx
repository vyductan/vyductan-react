import "@testing-library/jest-dom/vitest";

import * as React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test } from "vitest";

import { Editor } from "./editor";

Object.assign(globalThis, { React });

// The popover's positioner measures its trigger; jsdom ships no ResizeObserver.
globalThis.ResizeObserver ??= class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

afterEach(() => {
  cleanup();
});

const ICONS = [
  {
    name: "Halal.webp",
    label: "Halal",
    url: "https://example.test/icons/Halal.webp",
  },
  {
    name: "Vegan.webp",
    label: "Vegan",
    url: "https://example.test/icons/Vegan.webp",
  },
];

function renderEditor(contentIcons?: typeof ICONS) {
  let latestHtml = "";

  render(
    <Editor
      autoFocus={false}
      format="html"
      variant="simple"
      value="<p>Food</p>"
      contentIcons={contentIcons}
      onChange={(htmlString) => {
        latestHtml = htmlString;
      }}
    />,
  );

  return () => latestHtml;
}

describe("content icon picker", () => {
  test("has no toolbar button when the host supplies no icon set", () => {
    renderEditor();

    expect(
      screen.queryByRole("button", { name: "Insert Icon" }),
    ).not.toBeInTheDocument();
  });

  test("inserts the picked icon as an image at the fixed icon height", async () => {
    const user = userEvent.setup();
    const readHtml = renderEditor(ICONS);

    await user.click(screen.getByRole("button", { name: "Insert Icon" }));
    // Both the popover and the image node mount lazily, and the default
    // one-second budget is not enough for them under a loaded full-suite run.
    await user.click(
      await screen.findByRole("button", { name: "Halal" }, { timeout: 5000 }),
    );

    await waitFor(
      () => {
        const image = new DOMParser()
          .parseFromString(readHtml(), "text/html")
          .querySelector("img");

        expect(image?.getAttribute("src")).toBe(ICONS[0]!.url);
        // The label doubles as alt text — these icons carry the meaning of the
        // sentence they replace, so losing it would leave a screen reader with
        // nothing where the restriction used to be spelled out.
        expect(image?.getAttribute("alt")).toBe("Halal");
        expect(image?.getAttribute("height")).toBe("24");
        expect(image?.getAttribute("width")).toBe("24");
      },
      { timeout: 5000 },
    );
  });

  test("keeps two picked icons in one paragraph, side by side", async () => {
    const user = userEvent.setup();
    const readHtml = renderEditor(ICONS);

    for (const icon of ICONS) {
      await user.click(screen.getByRole("button", { name: "Insert Icon" }));
      await user.click(
        await screen.findByRole(
          "button",
          { name: icon.label },
          { timeout: 5000 },
        ),
      );
    }

    await waitFor(
      () => {
        const paragraphs = [
          ...new DOMParser()
            .parseFromString(readHtml(), "text/html")
            .querySelectorAll("p"),
        ];

        // A block per icon is how they end up stacked one per line once
        // published, so the markup has to keep them in the same flow — the
        // stylesheet can only restore the inline display preflight took away,
        // not undo a paragraph break.
        const withImages = paragraphs.filter(
          (paragraph) => paragraph.querySelectorAll("img").length > 0,
        );

        expect(withImages).toHaveLength(1);
        expect(withImages[0]!.querySelectorAll("img")).toHaveLength(2);
      },
      { timeout: 5000 },
    );
  });
});
