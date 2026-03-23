import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { Select } from "./select";

describe("Select", () => {
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
