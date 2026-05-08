import "@testing-library/jest-dom/vitest";

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

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

afterEach(cleanup);

describe("Form AntD basic example", () => {
  test("renders payment fields and a card checkbox option", () => {
    const { container } = render(<AntdBasicExample />);

    expect(
      screen.getByRole("textbox", { name: /name on card/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: /card number/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/soft limit \/ pax/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/hard limit \/ pax/i)).toBeInTheDocument();
    expect(
      screen.getByText(/soft limit must be less than or equal to/i),
    ).toBeInTheDocument();

    const cardCheckboxLabel = screen
      .getByText("Save payment method")
      .closest("label");

    expect(cardCheckboxLabel).toHaveClass("rounded-md", "border");
    expect(container.querySelector(".-mb-8")).toBeNull();
  });

  test("renders each payment validation error only once after submit", async () => {
    const { container } = render(<AntdBasicExample />);

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(
      await screen.findAllByText("Please input your card name!"),
    ).toHaveLength(1);
    expect(
      await screen.findAllByText("Please input your card number!"),
    ).toHaveLength(1);
    expect(
      await screen.findAllByText("Please input your soft limit!"),
    ).toHaveLength(1);
    expect(
      await screen.findAllByText("Please input your hard limit!"),
    ).toHaveLength(1);
    expect(container.querySelector(".-mb-8")).toBeNull();
  });

  test("reserves the previous row spacing with the error container after submit", async () => {
    const { container } = render(<AntdBasicExample />);

    const form = container.querySelector('form[name="basic"]');

    expect(form).toBeInstanceOf(HTMLElement);

    const formElement = form as HTMLElement;
    const cardNameInput = within(formElement).getByRole("textbox", {
      name: /name on card/i,
    });
    const cardNameRow = cardNameInput.closest('[data-slot="form-item"]');

    expect(cardNameRow).toHaveClass("mb-6");

    fireEvent.click(
      within(formElement).getByRole("button", { name: /submit/i }),
    );

    await within(formElement).findByText("Please input your card name!");

    const errorContainer = cardNameRow?.querySelector(
      '[data-slot="form-item-additional"]',
    );

    expect(cardNameRow).not.toHaveClass("mb-6");
    expect(cardNameRow).toHaveClass("mb-0");
    expect(errorContainer).toHaveClass("min-h-6");
    expect(container.querySelector(".-mb-8")).toBeNull();
  });
});
