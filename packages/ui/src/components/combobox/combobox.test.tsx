import "@testing-library/jest-dom/vitest";

import * as React from "react";

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "./index";

globalThis.ResizeObserver ??= class ResizeObserver {
  observe() {
    return;
  }

  unobserve() {
    return;
  }

  disconnect() {
    return;
  }
};

Element.prototype.scrollIntoView ??= () => undefined;

afterEach(() => {
  cleanup();
});

const getComboboxContainer = (placeholder: string) => {
  const inputGroup = screen
    .getByPlaceholderText(placeholder)
    .closest('[data-slot="input-group"]');

  return inputGroup?.parentElement ?? null;
};

describe("Combobox", () => {
  test("calls onChange with undefined when clearing a single combobox", async () => {
    const handleChange = vi.fn();

    render(
      <Combobox
        value="apple"
        allowClear
        placeholder="Pick a fruit"
        options={[
          { label: "Apple", value: "apple" },
          { label: "Banana", value: "banana" },
        ]}
        onChange={handleChange}
      />,
    );

    const group = getComboboxContainer("Pick a fruit");
    expect(group).not.toBeNull();
    fireEvent.pointerEnter(group as HTMLElement);

    const clearButton = await within(group as HTMLElement).findByRole("button", {
      name: /remove/i,
    });
    fireEvent.pointerDown(clearButton);

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith(undefined, undefined);
    });
  });

  test("clears a single combobox when the clear control is activated with Enter", async () => {
    const handleChange = vi.fn();

    render(
      <Combobox
        value="apple"
        allowClear
        placeholder="Pick a fruit"
        options={[
          { label: "Apple", value: "apple" },
          { label: "Banana", value: "banana" },
        ]}
        onChange={handleChange}
      />,
    );

    const group = getComboboxContainer("Pick a fruit");
    expect(group).not.toBeNull();
    fireEvent.pointerEnter(group as HTMLElement);

    const clearButton = await within(group as HTMLElement).findByRole("button", {
      name: /remove/i,
    });
    clearButton.focus();
    fireEvent.keyDown(clearButton, { key: "Enter" });

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith(undefined, undefined);
    });
  });

  test("calls onChange with empty arrays when clearing a multiple combobox", async () => {
    const handleChange = vi.fn();

    render(
      <Combobox
        mode="multiple"
        value={["apple", "banana"]}
        allowClear
        placeholder="Pick fruits"
        options={[
          { label: "Apple", value: "apple" },
          { label: "Banana", value: "banana" },
        ]}
        onChange={handleChange}
      />,
    );

    const group = getComboboxContainer("Pick fruits");
    expect(group).not.toBeNull();
    fireEvent.pointerEnter(group as HTMLElement);

    const clearButton = await within(group as HTMLElement).findByRole("button", {
      name: /remove/i,
    });
    fireEvent.pointerDown(clearButton);

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith([], []);
    });
  });

  test("renders a custom clear icon when allowClear.clearIcon is provided", async () => {
    render(
      <Combobox
        value="apple"
        allowClear={{ clearIcon: <span data-testid="custom-clear-icon">clear</span> }}
        placeholder="Pick a fruit"
        options={[
          { label: "Apple", value: "apple" },
          { label: "Banana", value: "banana" },
        ]}
      />,
    );

    const group = getComboboxContainer("Pick a fruit");
    expect(group).not.toBeNull();
    fireEvent.pointerEnter(group as HTMLElement);

    await within(group as HTMLElement).findByRole("button", { name: /remove/i });
    expect(screen.getByTestId("custom-clear-icon")).toBeInTheDocument();
  });

  test("calls onChange with empty arrays when clearing a tags combobox", async () => {
    const handleChange = vi.fn();

    render(
      <Combobox
        mode="tags"
        value={["apple", "banana"]}
        allowClear
        placeholder="Pick fruits"
        options={[
          { label: "Apple", value: "apple" },
          { label: "Banana", value: "banana" },
        ]}
        onChange={handleChange}
      />,
    );

    const group = getComboboxContainer("Pick fruits");
    expect(group).not.toBeNull();
    fireEvent.pointerEnter(group as HTMLElement);

    const clearButton = await within(group as HTMLElement).findByRole("button", {
      name: /remove/i,
    });
    fireEvent.pointerDown(clearButton);

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith([], []);
    });
  });

  test("does not show empty state when options are available", async () => {
    render(
      <Combobox
        placeholder="Pick a framework"
        options={[
          { label: "Next.js", value: "next" },
          { label: "Remix", value: "remix" },
        ]}
      />,
    );

    const input = screen.getByRole("combobox");
    fireEvent.click(input);
    fireEvent.keyDown(input, { key: "ArrowDown" });

    expect(await screen.findByText("Next.js")).toBeInTheDocument();
    expect(screen.queryByText("No options found.")).not.toBeInTheDocument();
  });

  test("selects the first matching option with Enter after typing by default", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Combobox
        placeholder="Pick a framework"
        options={[
          { label: "Next.js", value: "next" },
          { label: "Remix", value: "remix" },
        ]}
        onChange={handleChange}
      />,
    );

    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.keyboard("[ArrowDown]");
    await user.type(input, "N");
    await user.keyboard("[Enter]");

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith(
        "next",
        expect.objectContaining({ label: "Next.js", value: "next" }),
      );
    });
  });

  test("canonicalizes a tag to an existing option when the typed label matches", async () => {
    const handleChange = vi.fn();

    render(
      <Combobox
        mode="tags"
        placeholder="Add topics"
        options={[{ label: "Design", value: "design" }]}
        onChange={handleChange}
      />,
    );

    const input = screen.getByPlaceholderText("Add topics");

    fireEvent.click(input);
    fireEvent.change(input, { target: { value: "Design" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith(
        ["design"],
        [{ label: "Design", value: "design" }],
      );
    });

    expect(screen.getAllByText("Design").length).toBeGreaterThan(0);
    expect(screen.queryByText("design")).not.toBeInTheDocument();
  });

  test("creates a new tag value outside options in tags mode and clears the input", async () => {
    const handleChange = vi.fn();

    render(
      <Combobox
        mode="tags"
        placeholder="Add topics"
        options={[{ label: "Design", value: "design" }]}
        onChange={handleChange}
      />,
    );

    const input = screen.getByPlaceholderText("Add topics") as HTMLInputElement;

    fireEvent.click(input);
    fireEvent.change(input, { target: { value: "roadmap" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith(
        ["roadmap"],
        [{ label: "roadmap", value: "roadmap" }],
      );
    });

    expect(screen.getByText("roadmap")).toBeInTheDocument();
    await waitFor(() => {
      expect(input.value).toBe("");
    });
  });

  test("supports shadcn-like usage through the direct Combobox export", async () => {
    render(
      <Combobox items={["Next.js", "Remix"]}>
        <ComboboxInput placeholder="Select a framework" />
        <ComboboxContent>
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>,
    );

    const input = screen.getByRole("combobox");
    fireEvent.click(input);
    fireEvent.keyDown(input, { key: "ArrowDown" });

    expect(await screen.findByText("Next.js")).toBeInTheDocument();
    expect(screen.queryByText("No items found.")).not.toBeInTheDocument();
  });

  test("shows the selected option label in the single-mode input", async () => {
    render(
      <Combobox
        placeholder="Pick a fruit"
        options={[
          { label: "Apple", value: "apple" },
          { label: "Banana", value: "banana" },
        ]}
        value="banana"
      />,
    );

    expect(screen.getByRole("combobox")).toHaveValue("Banana");
  });

  test("keeps the selected label after clicking a controlled single-mode option", async () => {
    const user = userEvent.setup();

    function ControlledComboboxDemo(): React.JSX.Element {
      const [value, setValue] = React.useState<string | undefined>("banana");

      return (
        <Combobox
          placeholder="Pick a fruit"
          options={[
            { label: "Apple", value: "apple" },
            { label: "Banana", value: "banana" },
          ]}
          value={value}
          onChange={setValue}
        />
      );
    }

    render(<ControlledComboboxDemo />);

    const input = screen.getByPlaceholderText("Pick a fruit");

    await user.click(input);
    await user.keyboard("[ArrowDown]");
    await user.click(await screen.findByRole("option", { name: "Apple" }));

    await waitFor(() => {
      expect(input).toHaveValue("Apple");
    });

    await new Promise((resolve) => setTimeout(resolve, 600));

    expect(input).toHaveValue("Apple");
  });
});
