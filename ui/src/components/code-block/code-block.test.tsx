import React from "react";

import "@testing-library/jest-dom/vitest";

(globalThis as typeof globalThis & { React: typeof React }).React = React;
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

vi.mock("shiki/bundle/web", () => ({
  codeToHtml: vi.fn(async () =>
    '<pre class="shiki"><code><span class="line"><span style="color:#000">const x = 1;</span></span></code></pre>',
  ),
}));

vi.mock("usehooks-ts", () => ({
  useCopyToClipboard: () => [false, vi.fn()],
}));

vi.mock("../button", () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("../../icons", () => ({
  Icon: () => <span aria-hidden="true">icon</span>,
}));

import { CodeBlock } from "./code-block";

describe("CodeBlock", () => {
  test("marks the rendered shiki block as opt-out from Storybook docs typography reset", async () => {
    const { container } = render(<CodeBlock language="tsx">const x = 1;</CodeBlock>);

    await waitFor(() => {
      expect(container.querySelector(".shiki")).toBeInTheDocument();
    });

    expect(container.querySelector(".sb-unstyled .shiki")).toBeInTheDocument();
  });
});
