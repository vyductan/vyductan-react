import type { Meta, StoryObj } from "@storybook/nextjs-vite";
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
