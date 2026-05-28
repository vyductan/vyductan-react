import React from "react";

import "@testing-library/jest-dom/vitest";

import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import NestedDemo from "./examples/nested";
import { Portal } from "./portal";

globalThis.React = React;

globalThis.matchMedia ??= ((query: string) => ({
  matches: false,
  media: query,

  onchange: null,
  addEventListener: () => void 0,
  removeEventListener: () => void 0,
  addListener: () => void 0,
  removeListener: () => void 0,
  dispatchEvent: () => false,
})) as unknown as typeof globalThis.matchMedia;

describe("Menu nested demo", () => {
  test("renders the vertical nested menu demo without requiring external sidebar setup", () => {
    expect(() => {
      render(<NestedDemo />);
    }).not.toThrow();

    expect(screen.getByText("Navigation One")).toBeInTheDocument();
    expect(screen.getByText("Navigation Two")).toBeInTheDocument();
    expect(screen.getByText("Navigation Three")).toBeInTheDocument();
  });

  test("defers portal container resolution until refs are mounted", async () => {
    const PortalWithHostRef = () => {
      const hostReference = React.useRef<HTMLDivElement>(null);

      return (
        <>
          <Portal
            container={() => {
              if (!hostReference.current) {
                throw new Error("Portal container resolved before ref mounted");
              }
              return hostReference.current;
            }}
          >
            <span>Portal child</span>
          </Portal>
          <div data-testid="portal-host" ref={hostReference} />
        </>
      );
    };

    expect(() => render(<PortalWithHostRef />)).not.toThrow();

    await waitFor(() => {
      expect(screen.getByTestId("portal-host")).toContainElement(
        screen.getByText("Portal child"),
      );
    });
  });
});
