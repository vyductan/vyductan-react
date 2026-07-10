import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { AutoComplete } from "./auto-complete";

const storyOptions = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
] as const;

const meta = {
  title: "Components/AutoComplete",
  component: AutoComplete,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    mode: {
      control: "radio",
      options: ["combobox", "input"],
    },
    size: {
      control: "radio",
      options: ["small", "middle", "large"],
    },
    disabled: {
      control: "boolean",
    },
    loading: {
      control: "boolean",
    },
    allowClear: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof AutoComplete>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Pick a fruit",
    options: [...storyOptions],
    className: "w-[280px]",
    allowClear: true,
  },
};

export const InteractionSelectOption: Story = {
  args: {
    placeholder: "Pick a fruit",
    options: [...storyOptions],
    className: "w-[280px]",
    onChange: fn(),
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("open the combobox and select Banana", async () => {
      const trigger = canvas.getByRole("combobox");
      await userEvent.click(trigger);

      const option = within(document.body).getByText("Banana");
      await userEvent.click(option);

      await waitFor(async () => {
        await expect(args.onChange).toHaveBeenCalledWith(
          "banana",
          expect.objectContaining({ label: "Banana", value: "banana" }),
        );
      });
    });
  },
};

export const InteractionClearValue: Story = {
  args: {
    options: [...storyOptions],
  },
  render: () => {
    const [value, setValue] = React.useState<string | undefined>("banana");

    return (
      <div className="space-y-2">
        <div className="w-[280px]">
          <AutoComplete
            placeholder="Pick a fruit"
            options={[...storyOptions]}
            value={value}
            onChange={setValue}
            allowClear
            className="w-full"
          />
        </div>
        <div data-testid="selected-value">{value ?? "empty"}</div>
      </div>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("clear the current value", async () => {
      const clearButton = canvasElement.querySelector(
        '[role="button"][class*="icon-[ant-design--close-circle-filled]"]',
      );

      if (!(clearButton instanceof HTMLElement)) {
        throw new TypeError("Clear button not found");
      }

      await userEvent.click(clearButton);

      await waitFor(async () => {
        await expect(canvas.getByTestId("selected-value")).toHaveTextContent(
          "empty",
        );
      });
    });
  },
};

export const InteractionInputSearch: Story = {
  args: {
    options: [...storyOptions],
  },
  render: () => {
    const [search, setSearch] = React.useState("");

    return (
      <div className="space-y-2">
        <div className="w-[320px]">
          <AutoComplete
            mode="input"
            placeholder="Search a city"
            searchPlaceholder="Type to filter"
            options={[
              { label: "Ho Chi Minh City", value: "hcm" },
              { label: "Ha Noi", value: "hn" },
              { label: "Da Nang", value: "dn" },
            ]}
            onSearchChange={setSearch}
          />
        </div>
        <div data-testid="search-value">{search || "empty"}</div>
      </div>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step(
      "type into input mode and confirm search callback state",
      async () => {
        const input = canvas.getByPlaceholderText("Search a city");
        await userEvent.type(input, "Ha");

        await waitFor(async () => {
          await expect(canvas.getByTestId("search-value")).toHaveTextContent(
            "Ha",
          );
        });

        await expect(within(document.body).getByText("Ha Noi")).toBeTruthy();
      },
    );
  },
};

const inputModeOptions = [
  { label: "Ho Chi Minh City", value: "hcm" },
  { label: "Ha Noi", value: "hn" },
  { label: "Da Nang", value: "dn" },
];

export const InteractionInputCloseOnOutside: Story = {
  args: {
    options: [...storyOptions],
  },
  render: () => (
    <div className="space-y-2">
      <div className="w-[320px]">
        <AutoComplete
          mode="input"
          placeholder="Search a city"
          options={inputModeOptions}
        />
      </div>
      <button type="button" data-testid="outside">
        outside
      </button>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await step("typing opens the panel", async () => {
      await userEvent.type(canvas.getByPlaceholderText("Search a city"), "Ha");
      await waitFor(async () => {
        await expect(body.getByText("Ha Noi")).toBeInTheDocument();
      });
    });

    await step("clicking outside closes the panel", async () => {
      await userEvent.click(canvas.getByTestId("outside"));
      await waitFor(async () => {
        await expect(body.queryByText("Ha Noi")).not.toBeInTheDocument();
      });
    });
  },
};

export const InteractionInputCloseOnEscape: Story = {
  args: {
    options: [...storyOptions],
  },
  render: () => (
    <div className="w-[320px]">
      <AutoComplete
        mode="input"
        placeholder="Search a city"
        options={inputModeOptions}
      />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await step("typing opens the panel", async () => {
      await userEvent.type(canvas.getByPlaceholderText("Search a city"), "Ha");
      await waitFor(async () => {
        await expect(body.getByText("Ha Noi")).toBeInTheDocument();
      });
    });

    await step("pressing Escape closes the panel", async () => {
      await userEvent.keyboard("{Escape}");
      await waitFor(async () => {
        await expect(body.queryByText("Ha Noi")).not.toBeInTheDocument();
      });
    });
  },
};

export const InteractionInputHidesSearchRow: Story = {
  args: {
    options: [...storyOptions],
  },
  render: () => (
    <div className="w-[320px]">
      <AutoComplete
        mode="input"
        placeholder="Search a city"
        searchPlaceholder="Type to filter"
        options={inputModeOptions}
      />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await step("typing opens the panel", async () => {
      await userEvent.type(canvas.getByPlaceholderText("Search a city"), "Ha");
      await waitFor(async () => {
        await expect(body.getByText("Ha Noi")).toBeInTheDocument();
      });
    });

    await step(
      "internal Command search row is hidden (no duplicate search box)",
      async () => {
        // Regression: input mode must not render a second search row inside the
        // dropdown. The Command input stays mounted (so it keeps driving the
        // filter) but its chrome — search icon + border row — must be wrapped
        // in sr-only. Previously sr-only landed on the inner <input> only,
        // leaving the icon/border row visible.
        const searchInput = document.body.querySelector(
          '[data-slot="command-input"]',
        );
        await expect(searchInput).not.toBeNull();

        const searchRow = document.body.querySelector(
          '[data-slot="command-input-wrapper"]',
        );
        await expect(searchRow).not.toBeNull();
        await expect(searchRow?.closest(".sr-only")).not.toBeNull();
      },
    );
  },
};

export const InteractionInputClickKeepsOpen: Story = {
  args: {
    options: [...storyOptions],
  },
  render: () => (
    <div className="w-[320px]">
      <AutoComplete
        mode="input"
        placeholder="Search a city"
        options={inputModeOptions}
      />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await step("typing opens the panel", async () => {
      await userEvent.type(canvas.getByPlaceholderText("Search a city"), "Ha");
      await waitFor(async () => {
        await expect(body.getByText("Ha Noi")).toBeInTheDocument();
      });
    });

    await step(
      "clicking the already-focused input keeps the panel open",
      async () => {
        // Regression: input mode must anchor (not click-toggle) the panel.
        // With the old `trigger="click"` a click on the focused input toggled
        // the panel closed (and flickered on first focus). The panel must stay
        // open — close is driven by outside click / Escape / selection instead.
        await userEvent.click(canvas.getByPlaceholderText("Search a city"));
        await waitFor(async () => {
          const content = document.body.querySelector(
            '[data-slot="popover-content"]',
          );
          await expect(content).not.toBeNull();
          await expect(content).toHaveAttribute("data-state", "open");
        });
      },
    );
  },
};
