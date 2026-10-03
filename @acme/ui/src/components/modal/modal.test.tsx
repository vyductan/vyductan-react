import React from "react";

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { Button } from "../button";
import { Modal } from "./modal";

afterEach(() => cleanup());

globalThis.React = React;

globalThis.ResizeObserver ??= class ResizeObserver {
  observe() {
    return;
  }

  unobserve() {
    return;
  }

  disconnect() {
    return;
  }
};

describe("Modal", () => {
  test("applies a responsive max-width override when width is provided", () => {
    render(
      React.createElement(
        Modal,
        { open: true, width: 800, title: "Custom Width Modal" },
        React.createElement("div", undefined, "Body"),
      ),
    );

    const content = screen.getByRole("dialog");

    expect(content).toHaveClass("w-(--modal-width)");
    expect(content).toHaveClass("sm:max-w-(--modal-width)");
    expect(content).not.toHaveClass("sm:max-w-auto");
  });

  // Regression: `className="max-w-5xl"` used to land in the DOM and do nothing.
  // The default width emitted `sm:max-w-(--modal-width)`, and an `sm:` utility
  // outranks an unprefixed one at every width >= 640px, so the caller's class
  // lost to the 520px default with no warning.
  test("a caller max-w-* class governs the width when no width prop is given", () => {
    render(
      <Modal open title="Wide" className="max-w-5xl">
        Body
      </Modal>,
    );

    const content = screen.getByRole("dialog");

    expect(content).toHaveClass("max-w-5xl");
    expect(content).not.toHaveClass("sm:max-w-(--modal-width)");
    expect(content).not.toHaveClass("w-(--modal-width)");
    // DialogContent's own phone gutter is a base `max-w-*`, so the caller's
    // class replaces it; it comes back under `max-sm:`.
    expect(content).toHaveClass("max-sm:max-w-[calc(100%-2rem)]");
  });

  test("an explicit width still wins over a caller max-w-* class", () => {
    render(
      <Modal open title="Wide" width={800} className="max-w-5xl">
        Body
      </Modal>,
    );

    const content = screen.getByRole("dialog");

    expect(content).toHaveClass("sm:max-w-(--modal-width)");
    expect(content).toHaveClass("w-(--modal-width)");
  });

  test("a caller sm:max-w-* class is left to tailwind-merge", () => {
    // Same variant group as ours, so the caller's class already wins on merge
    // order — stepping aside here would drop the width entirely instead.
    render(
      <Modal open title="Narrow" className="sm:max-w-[500px]">
        Body
      </Modal>,
    );

    const content = screen.getByRole("dialog");

    expect(content).toHaveClass("w-(--modal-width)");
    expect(content).toHaveClass("sm:max-w-[500px]");
  });

  // Regression: the object form only set `--modal-<bp>-width` variables and no
  // class read them, so `{ md: 760, lg: 1000 }` rendered the 512px
  // `sm:max-w-lg` default at every width.
  test("a responsive width caps the dialog per breakpoint", () => {
    render(
      <Modal open title="Responsive" width={{ md: 760, lg: 1000 }}>
        Body
      </Modal>,
    );

    const content = screen.getByRole("dialog");

    expect(content).toHaveClass(
      "w-full",
      "sm:max-w-(--modal-sm-width)",
      "md:max-w-(--modal-md-width)",
      "lg:max-w-(--modal-lg-width)",
      "xl:max-w-(--modal-xl-width)",
      "2xl:max-w-(--modal-xxl-width)",
    );
    expect(content).not.toHaveClass("sm:max-w-lg");
    expect(content).not.toHaveClass("w-(--modal-width)");
    // Skipped breakpoints take the nearest smaller one; below the smallest
    // given, sm falls back to the 520px default. xs stays unset (phone gutter).
    expect(content.style.getPropertyValue("--modal-xs-width")).toBe("");
    expect(content.style.getPropertyValue("--modal-sm-width")).toBe("520px");
    expect(content.style.getPropertyValue("--modal-md-width")).toBe("760px");
    expect(content.style.getPropertyValue("--modal-lg-width")).toBe("1000px");
    expect(content.style.getPropertyValue("--modal-xl-width")).toBe("1000px");
    expect(content.style.getPropertyValue("--modal-xxl-width")).toBe("1000px");
  });

  test("a responsive xs width caps phones and seeds the larger breakpoints", () => {
    render(
      <Modal open title="Responsive" width={{ xs: "90vw", lg: 900 }}>
        Body
      </Modal>,
    );

    const content = screen.getByRole("dialog");

    expect(content).toHaveClass(
      "max-w-[min(var(--modal-xs-width),calc(100%-2rem))]",
    );
    expect(content.style.getPropertyValue("--modal-xs-width")).toBe("90vw");
    expect(content.style.getPropertyValue("--modal-sm-width")).toBe("90vw");
    expect(content.style.getPropertyValue("--modal-md-width")).toBe("90vw");
    expect(content.style.getPropertyValue("--modal-lg-width")).toBe("900px");
  });

  test("wraps fragment descriptions with DialogDescription", () => {
    render(
      <Modal
        open
        title="Per-pax limits"
        description={
          <>
            Configure per-pax limits for{" "}
            <span className="text-foreground font-medium">Food</span>.
          </>
        }
      >
        Body
      </Modal>,
    );

    const categoryName = screen.getByText("Food");
    const description = categoryName.closest(
      '[data-slot="dialog-description"]',
    );

    expect(description).toBeInTheDocument();
    expect(description).toHaveTextContent("Configure per-pax limits for Food.");
  });

  // Regression: a disabled trigger must not open the modal. The Button used
  // `loading ?? disabled`, so `loading={false}` discarded `disabled` and the
  // native disabled attribute was dropped, letting the Radix trigger fire.
  test.each([
    { name: "disabled", node: <Button disabled>Open</Button> },
    {
      name: "disabled + loading={false}",
      node: (
        <Button disabled loading={false}>
          Open
        </Button>
      ),
    },
  ])("disabled trigger ($name) does not open the modal", ({ node }) => {
    render(
      <Modal title="T" trigger={node}>
        Body
      </Modal>,
    );

    const trigger = screen.getByRole("button", { name: "Open" });
    expect(trigger).toBeDisabled();

    fireEvent.click(trigger);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
