import type React from "react";

import "@testing-library/jest-dom/vitest";

import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import * as storiesModule from "./alert.stories";
import {
  Basic,
  Description,
  ShowIcon,
  Types,
  WithoutBorder,
} from "./alert.stories";

vi.mock("../mdx/component-source", () => ({
  ComponentSource: ({
    src,
    __comp__: Example,
  }: {
    src: string;
    __comp__: React.ComponentType;
  }) => (
    <div data-testid="component-source">
      <div data-slot="code-box-demo">{src}</div>
      <Example />
    </div>
  ),
}));

describe("Alert stories", () => {
  test("exports the required docs-first stories in spec order", () => {
    expect(
      Object.keys(storiesModule).filter((key) => key !== "default"),
    ).toEqual(["Basic", "Description", "Types", "ShowIcon", "WithoutBorder"]);
  });

  test("renders each docs-first story through ComponentSource with the expected example path", () => {
    const stories = [
      [Basic, "alert/examples/basic.tsx"],
      [Description, "alert/examples/description.tsx"],
      [Types, "alert/examples/types.tsx"],
      [ShowIcon, "alert/examples/show-icon.tsx"],
      [WithoutBorder, "alert/examples/without-border.tsx"],
    ] as const;

    for (const [story, expectedPath] of stories) {
      const rendered = story.render?.({} as never, {} as never);
      expect(rendered).toBeTruthy();

      const { container, unmount } = render(rendered);
      expect(
        container.querySelector('[data-slot="code-box-demo"]'),
      ).toHaveTextContent(expectedPath);
      unmount();
    }
  });

  test("Types documents all Alert status variants", () => {
    const rendered = Types.render?.({} as never, {} as never);
    expect(rendered).toBeTruthy();

    render(rendered);

    expect(screen.getByText("Deployment ready")).toBeInTheDocument();
    expect(screen.getByText("New policy available")).toBeInTheDocument();
    expect(screen.getByText("Usage approaching limit")).toBeInTheDocument();
    expect(screen.getByText("Payment failed")).toBeInTheDocument();
  });

  test("WithoutBorder demonstrates the borderless treatment", () => {
    const rendered = WithoutBorder.render?.({} as never, {} as never);
    expect(rendered).toBeTruthy();

    const { container } = render(rendered);

    expect(container.querySelector('[role="alert"]')).toHaveClass(
      "border-transparent",
    );
  });
});
