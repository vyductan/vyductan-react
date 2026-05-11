import "@testing-library/jest-dom/vitest";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { Select as PublicSelect } from ".";
import { Select } from "./select";

describe("Select", () => {
  test("accepts form field props with options", () => {
    const field = {
      name: "expiryMonth",
      ref: vi.fn(),
      value: "01",
      disabled: false,
      onBlur: vi.fn(),
      onChange: vi.fn(),
    };

    render(
      <PublicSelect
        {...field}
        placeholder="MM"
        options={[{ label: "01", value: "01" }]}
      />,
    );

    const trigger = screen.getByRole("combobox", { name: "MM" });

    expect(trigger).toBeInTheDocument();
    expect(field.ref).toHaveBeenCalledWith(trigger);

    fireEvent.blur(trigger);

    expect(field.onBlur).toHaveBeenCalledOnce();
  });

  test("keeps long selected labels constrained inside the trigger", () => {
    render(
      <Select
        value="long"
        placeholder="Select an option"
        options={[
          {
            label:
              "A very long option label that should truncate instead of making the select wider",
            value: "long",
          },
        ]}
      />,
    );

    const trigger = screen.getByRole("combobox", { name: "Select an option" });

    expect(trigger.className).toContain("min-w-0");
    expect(trigger.className).toContain("text-left");
    expect(trigger.className).toContain("*:data-[slot=select-value]:min-w-0");
    expect(trigger.className).toContain("*:data-[slot=select-value]:flex-1");
    expect(trigger.className).toContain("*:data-[slot=select-value]:block!");
  });

  test("calls onChange when clearing a single select", async () => {
    const handleChange = vi.fn();

    render(
      <Select
        value="1"
        allowClear
        placeholder="Select an option"
        options={[{ label: "Option 1", value: "1" }]}
        onChange={handleChange}
      />,
    );

    const clearButton = screen.getByRole("button", { name: /remove/i });
    fireEvent.pointerDown(clearButton);

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith(undefined, undefined);
    });
  });

  test("selects the active tags option with the keyboard", async () => {
    const handleChange = vi.fn();

    render(
      <Select
        mode="tags"
        placeholder="Type to add tags"
        options={[{ label: "Alpha", value: "alpha" }]}
        onChange={handleChange}
      />,
    );

    const input = screen.getByPlaceholderText("Type to add tags");

    fireEvent.click(input);
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith(
        ["alpha"],
        [{ label: "Alpha", value: "alpha" }],
      );
    });
  });

  test("commits typed tag on blur in tags mode", async () => {
    const handleChange = vi.fn();

    render(
      <Select
        mode="tags"
        placeholder="Type to add tags"
        options={[]}
        onChange={handleChange}
      />,
    );

    const input = screen.getByPlaceholderText("Type to add tags");

    fireEvent.click(input);
    fireEvent.change(input, { target: { value: "xxx" } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith(
        ["xxx"],
        [{ label: "xxx", value: "xxx" }],
      );
    });

    expect(input).toHaveValue("");
    expect(screen.getByText("xxx")).toBeInTheDocument();
  });
});
