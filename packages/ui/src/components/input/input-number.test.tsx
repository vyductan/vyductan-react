import "@testing-library/jest-dom/vitest";

import * as React from "react";
import userEvent from "@testing-library/user-event";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { InputNumber } from "./number";

globalThis.React = React;

afterEach(() => {
  cleanup();
});

describe("InputNumber spinner mode", () => {
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
    const decreaseButton = screen.getByRole("button", { name: "Decrease value" });
    const increaseButton = screen.getByRole("button", { name: "Increase value" });

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

    expect(screen.getByRole("spinbutton", { name: "Quantity" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Decrease value" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Increase value" })).not.toBeInTheDocument();
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

    expect(screen.getByRole("button", { name: "Decrease value" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Increase value" })).toBeDisabled();
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
    expect(screen.queryByRole("button", { name: "Clear value" })).not.toBeInTheDocument();
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
      <InputNumber mode="spinner" aria-label="Quantity" defaultValue={2} min={0} />,
    );

    const input = screen.getByRole("spinbutton", { name: "Quantity" });
    const increaseButton = screen.getByRole("button", { name: "Increase value" });

    fireEvent.mouseDown(increaseButton);
    expect(input).toHaveValue("3");

    fireEvent.mouseLeave(increaseButton);
    increaseButton.focus();
    await user.keyboard("{Enter}");

    expect(input).toHaveValue("4");
  });
});
