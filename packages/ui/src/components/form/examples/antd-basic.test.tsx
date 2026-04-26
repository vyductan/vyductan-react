import "@testing-library/jest-dom/vitest";

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import AntdBasicExample from "./antd-basic";

globalThis.ResizeObserver ??= class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

globalThis.matchMedia ??= (() => ({
  matches: false,
  media: "",
  onchange: null,
  addListener() {},
  removeListener() {},
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent() {
    return false;
  },
})) as typeof globalThis.matchMedia;

describe("Form AntD basic example", () => {
  test("renders each validation error only once after submit", async () => {
    const { container } = render(<AntdBasicExample />);

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(
      await screen.findAllByText("Please input your username!"),
    ).toHaveLength(1);
    expect(
      await screen.findAllByText("Please input your password!"),
    ).toHaveLength(1);
    expect(container.querySelector(".-mb-8")).toBeNull();
  });

  test("reserves the previous row spacing with the error container after submit", async () => {
    const { container } = render(<AntdBasicExample />);

    const form = container.querySelector('form[name="basic"]');

    expect(form).toBeInstanceOf(HTMLElement);

    const formElement = form as HTMLElement;
    const usernameInput = within(formElement).getByRole("textbox", {
      name: /username/i,
    });
    const usernameRow = usernameInput.closest('[data-slot="form-item"]');

    expect(usernameRow).toHaveClass("mb-6");

    fireEvent.click(
      within(formElement).getByRole("button", { name: /submit/i }),
    );

    await within(formElement).findByText("Please input your username!");

    const errorContainer = usernameRow?.querySelector(
      '[data-slot="form-item-additional"]',
    );

    expect(usernameRow).not.toHaveClass("mb-6");
    expect(usernameRow).toHaveClass("mb-0");
    expect(errorContainer).toHaveClass("min-h-6");
    expect(container.querySelector(".-mb-8")).toBeNull();
  });
});
