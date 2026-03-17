import React from "react";
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { Select } from "./select";

describe("Select", () => {
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
