import "@testing-library/jest-dom/vitest";

import { readFileSync } from "node:fs";
import path from "node:path";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import BasicExample from "./basic";

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

describe("Form basic example", () => {
  test("documents Select with the options prop instead of composable children", () => {
    const source = readFileSync(
      path.resolve(import.meta.dirname, "./basic.tsx"),
      "utf8",
    );

    expect(source).toContain("options={[");
    expect(source).not.toContain("SelectContent");
    expect(source).not.toContain("SelectItem");
  });

  test("marks required field labels from the schema", () => {
    render(<BasicExample />);

    expect(screen.getByText("Name on Card").closest("label")).toHaveTextContent(
      "Name on Card*",
    );
    expect(screen.getByText("Card Number").closest("label")).toHaveTextContent(
      "Card Number*",
    );
    expect(screen.getByText("Comments").closest("label")).not.toHaveTextContent(
      "Comments*",
    );
  });

  test("renders limit fields with a nearby guidance note", () => {
    render(<BasicExample />);

    expect(screen.getByLabelText(/soft limit \/ pax/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/hard limit \/ pax/i)).toBeInTheDocument();

    const note = screen.getByText(
      /soft limit must be less than or equal to/i,
    ).parentElement;

    expect(note).toHaveClass("rounded-md", "border", "bg-blue-50");
    expect(note?.parentElement).toHaveClass("space-y-6");
  });

  test("uses compact field spacing for limit fields", () => {
    render(<BasicExample />);

    for (const label of [/soft limit \/ pax/i, /hard limit \/ pax/i]) {
      const input = screen.getByLabelText(label);
      const field = input.closest('[data-slot="field"]');

      expect(field).toHaveClass("gap-1");
      expect(field?.querySelector('[data-slot="field-error"]')).toBeNull();
    }
  });

  test("renders each validation error only once after submit", async () => {
    render(<BasicExample />);

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

    const limitNote = screen.getByText(
      /soft limit must be less than or equal to/i,
    );
    const limitSection = limitNote.closest("div")?.parentElement;

    expect(
      within(limitSection as HTMLElement).getAllByText(
        /please input your .* limit!/i,
      ),
    ).toHaveLength(2);
  });
});
