import "@testing-library/jest-dom/vitest";

import type { MockInstance } from "vitest";
import { render } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import { Icon } from "@acme/ui/icons";

import { Button } from "./button";

// The accessible-name warning is DOM-based: it must see name sources that
// props can't (sr-only text inside `icon`, `title`), and it must not spam
// the console on every re-render.

const a11yWarnings = (warn: MockInstance) =>
  warn.mock.calls.filter((call) =>
    String(call[0]).includes("accessible name"),
  );

test("icon-only button without any name warns once, not per re-render", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

  /* eslint-disable acme-a11y/button-accessible-name -- nameless on purpose: the warning is what's under test */
  const { rerender } = render(<Button icon={<svg />} />);
  rerender(<Button icon={<svg />} />);
  rerender(<Button icon={<svg />} />);
  /* eslint-enable acme-a11y/button-accessible-name */

  expect(a11yWarnings(warn)).toHaveLength(1);
  warn.mockRestore();
});

test("sr-only text inside the icon counts as an accessible name", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

  // Mirrors the ButtonMore pattern: <Icon srOnly="More" />
  render(
    <Button
      variant="text"
      icon={<Icon icon="icon-[lucide--more-vertical]" srOnly="More" />}
    />,
  );

  expect(a11yWarnings(warn)).toHaveLength(0);
  warn.mockRestore();
});

test("title counts as an accessible name", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

  render(<Button icon={<svg />} title="Remove file" />);

  expect(a11yWarnings(warn)).toHaveLength(0);
  warn.mockRestore();
});

test("aria-label counts as an accessible name", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

  render(<Button icon={<svg />} aria-label="Close" />);

  expect(a11yWarnings(warn)).toHaveLength(0);
  warn.mockRestore();
});

test("user ref still receives the button element alongside the a11y check", () => {
  const ref = vi.fn();
  render(<Button icon={<svg />} aria-label="Close" ref={ref} />);

  expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
});
