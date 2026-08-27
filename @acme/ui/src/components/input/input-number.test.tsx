import "@testing-library/jest-dom/vitest";

import * as React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";

import { InputNumber } from "./number";

globalThis.React = React;

afterEach(() => {
  cleanup();
});

describe("InputNumber default mode", () => {
  test("uses primary border for focused outlined state", () => {
    render(<InputNumber aria-label="Quantity" defaultValue={2} />);

    const input = screen.getByRole("spinbutton", { name: "Quantity" });
    const affixWrapper = input.closest('[data-slot="affix-wrapper"]');

    expect(affixWrapper).toHaveClass("focus-within:border-primary-500");
    expect(affixWrapper).toHaveClass("focus-within:ring-primary-500/20");
    expect(affixWrapper).not.toHaveClass("focus-within:border-ring");
    expect(affixWrapper).not.toHaveClass("focus-within:ring-ring/50");
  });

  test("keeps controls from inheriting error text color", () => {
    render(<InputNumber aria-label="Quantity" defaultValue={2} aria-invalid />);

    const increaseButton = screen.getByRole("button", {
      name: "Increase Value",
    });
    const decreaseButton = screen.getByRole("button", {
      name: "Decrease Value",
    });
    const increaseIcon = increaseButton.querySelector('[role="img"]');
    const decreaseIcon = decreaseButton.querySelector('[role="img"]');

    expect(increaseButton).toHaveClass("text-muted-foreground");
    expect(decreaseButton).toHaveClass("text-muted-foreground");
    expect(increaseIcon).toHaveClass("text-muted-foreground");
    expect(decreaseIcon).toHaveClass("text-muted-foreground");
  });
});

describe("InputNumber spinner mode", () => {
  test("renders spinner mode inside a group shell", () => {
    render(
      <InputNumber mode="spinner" aria-label="Quantity" defaultValue={2} />,
    );

    const group = screen.getByRole("group");
    const input = screen.getByRole("spinbutton", { name: "Quantity" });
    const decreaseButton = screen.getByRole("button", {
      name: "Decrease value",
    });
    const increaseButton = screen.getByRole("button", {
      name: "Increase value",
    });

    expect(group).toBeInTheDocument();
    expect(group).toContainElement(decreaseButton);
    expect(group).toContainElement(input);
    expect(group).toContainElement(increaseButton);
  });

  test("uses Button controls and keeps the spinner input from collapsing", () => {
    render(
      <InputNumber mode="spinner" aria-label="Quantity" defaultValue={2} />,
    );

    const spinner = screen.getByRole("group");
    const input = screen.getByRole("spinbutton", { name: "Quantity" });
    const decreaseButton = screen.getByRole("button", {
      name: "Decrease value",
    });
    const increaseButton = screen.getByRole("button", {
      name: "Increase value",
    });

    expect(decreaseButton).toHaveAttribute("data-slot", "button");
    expect(increaseButton).toHaveAttribute("data-slot", "button");
    expect(spinner).toHaveClass("w-[120px]");
    expect(spinner).toHaveClass("h-8");
    expect(spinner).not.toHaveClass("px-3");
    expect(spinner).not.toHaveClass("py-1");
    expect(input).not.toHaveClass("w-px");
    expect(input).not.toHaveClass("text-left");
    expect(input).toHaveClass("min-w-0");
    expect(input).toHaveClass("w-full");
  });

  test("renders inline decrement and increment buttons and updates the value", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <InputNumber
        mode="spinner"
        aria-label="Quantity"
        min={1}
        max={5}
        defaultValue={3}
        onChange={handleChange}
      />,
    );

    const input = screen.getByRole("spinbutton", { name: "Quantity" });
    const decreaseButton = screen.getByRole("button", {
      name: "Decrease value",
    });
    const increaseButton = screen.getByRole("button", {
      name: "Increase value",
    });

    await expect(input).toHaveValue("3");

    await user.click(increaseButton);
    await expect(input).toHaveValue("4");

    await user.click(decreaseButton);
    await expect(input).toHaveValue("3");

    expect(handleChange).toHaveBeenCalledTimes(2);
    expect(handleChange).toHaveBeenNthCalledWith(1, 4);
    expect(handleChange).toHaveBeenNthCalledWith(2, 3);
  });

  test("hides spinner actions when controls is false", () => {
    render(
      <InputNumber
        mode="spinner"
        aria-label="Quantity"
        controls={false}
        defaultValue={2}
      />,
    );

    expect(
      screen.getByRole("spinbutton", { name: "Quantity" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Decrease value" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Increase value" }),
    ).not.toBeInTheDocument();
  });

  test("disables spinner actions when readOnly is true", () => {
    render(
      <InputNumber
        mode="spinner"
        aria-label="Quantity"
        readOnly
        defaultValue={2}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Decrease value" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Increase value" }),
    ).toBeDisabled();
  });

  test("keeps prefix and suffix but omits allowClear and addons in spinner mode", () => {
    render(
      <InputNumber
        mode="spinner"
        aria-label="Quantity"
        defaultValue={2}
        prefix="Qty"
        suffix="items"
        allowClear
        addonBefore="before"
        addonAfter="after"
      />,
    );

    expect(screen.getByText("Qty")).toBeInTheDocument();
    expect(screen.getByText("items")).toBeInTheDocument();
    expect(screen.queryByText("before")).not.toBeInTheDocument();
    expect(screen.queryByText("after")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Clear value" }),
    ).not.toBeInTheDocument();
  });

  test("uses custom spinner control icons when controls is an object", () => {
    render(
      <InputNumber
        mode="spinner"
        aria-label="Quantity"
        defaultValue={2}
        controls={{
          upIcon: <span data-testid="spinner-plus">plus</span>,
          downIcon: <span data-testid="spinner-minus">minus</span>,
        }}
      />,
    );

    expect(screen.getByTestId("spinner-minus")).toBeInTheDocument();
    expect(screen.getByTestId("spinner-plus")).toBeInTheDocument();
  });

  test("does not swallow keyboard activation after a spinner hold ends without click", async () => {
    const user = userEvent.setup();

    render(
      <InputNumber
        mode="spinner"
        aria-label="Quantity"
        defaultValue={2}
        min={0}
      />,
    );

    const input = screen.getByRole("spinbutton", { name: "Quantity" });
    const increaseButton = screen.getByRole("button", {
      name: "Increase value",
    });

    fireEvent.mouseDown(increaseButton);
    expect(input).toHaveValue("3");

    fireEvent.mouseLeave(increaseButton);
    increaseButton.focus();
    await user.keyboard("{Enter}");

    expect(input).toHaveValue("4");
  });
});

describe("InputNumber addon inset", () => {
  // With addons the wrapper is forced to p-0 (addons must touch the border), so
  // the inline inset has to be restored on the inner box or the value renders
  // flush against the border. The affix wrapper only exists when a prefix/suffix
  // slot is filled (spinner controls count, and allowClear flips with the value),
  // so both boxes carry it and the wrapper zeroes the input's copy.
  const insetBySize = { small: "px-2", middle: "px-3", large: "px-3" } as const;

  test.each(["small", "middle", "large"] as const)(
    "keeps the value inset with an addon at size %s",
    (size) => {
      render(
        <InputNumber
          aria-label="Quantity"
          size={size}
          value={4}
          addonAfter="days"
        />,
      );

      const input = screen.getByRole("spinbutton", { name: "Quantity" });
      expect(input).toHaveClass(insetBySize[size]);

      const affixWrapper = input.closest('[data-slot="affix-wrapper"]');
      expect(affixWrapper).toHaveClass(insetBySize[size], "[&_input]:px-0");
    },
  );

  test("keeps the value inset with an addon and no affix wrapper", () => {
    render(
      <InputNumber
        aria-label="Quantity"
        value={4}
        controls={false}
        addonBefore="$"
      />,
    );

    const input = screen.getByRole("spinbutton", { name: "Quantity" });
    expect(input.closest('[data-slot="affix-wrapper"]')).toBeNull();
    expect(input).toHaveClass("px-3");
  });

  test("does not double the inset when a prefix renders the affix wrapper", () => {
    render(
      <InputNumber
        aria-label="Quantity"
        value={4}
        prefix="#"
        addonAfter="days"
      />,
    );

    const affixWrapper = screen
      .getByRole("spinbutton", { name: "Quantity" })
      .closest('[data-slot="affix-wrapper"]');

    expect(affixWrapper).toHaveClass("px-3", "[&_input]:px-0");
  });

  test("leaves spinner mode untouched (addons are dropped there)", () => {
    render(
      <InputNumber
        mode="spinner"
        aria-label="Quantity"
        value={4}
        addonAfter="days"
      />,
    );

    const input = screen.getByRole("spinbutton", { name: "Quantity" });
    expect(input).not.toHaveClass("px-3");
  });
});
