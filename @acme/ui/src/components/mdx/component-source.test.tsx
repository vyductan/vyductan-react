import React from "react";

import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

vi.mock("@acme/ui/components/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("./collapsible-code-block", () => ({
  CollapsibleCodeBlock: ({
    language,
    content,
  }: {
    language: string;
    content: string;
  }) => (
    <div>
      <div data-testid="language">{language}</div>
      <pre data-testid="content">{content}</pre>
    </div>
  ),
}));

import { ComponentSource } from "./component-source";

function DemoComponent() {
  return <div>demo</div>;
}

describe("ComponentSource", () => {
  test("passes actual source code content to the code block instead of the demo file path", () => {
    render(<ComponentSource src="button/demo/sizes.tsx" __comp__={DemoComponent} />);

    expect(screen.getByTestId("language")).toHaveTextContent("tsx");
    expect(screen.getByTestId("content").textContent).toContain(
      'import { Button } from "@acme/ui/components/button";',
    );
    expect(screen.getByTestId("content").textContent).not.toBe("button/demo/sizes.tsx");
  });
});
