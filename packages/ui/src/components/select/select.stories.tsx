import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import {
  expect,
  fireEvent,
  screen,
  userEvent,
  waitFor,
  within,
} from "storybook/test";

import type { SelectProps } from "./select";
import type { OptionType } from "./types";
import { Select } from "./select";

const meta = {
  title: "Components/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },

  argTypes: {
    variant: {
      control: "select",
      options: ["outlined", "filled", "borderless"],
    },
    size: {
      control: "radio",
      options: ["small", "middle", "large"],
    },
    status: {
      control: "select",
      options: ["error", "warning"],
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
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;
type SingleSelectStoryArgs = Omit<
  SelectProps<string>,
  "mode" | "value" | "defaultValue" | "options"
>;

type SelectPreviewArgs = SingleSelectStoryArgs;
type SingleSelectComponentProps = Extract<
  SelectProps<string>,
  { mode?: never }
>;

const SingleSelectPreview = (
  props: SingleSelectStoryArgs & {
    options: OptionType<string>[];
    value?: string;
  },
) => <Select<string> {...(props as SingleSelectComponentProps)} />;

const basicOptions: OptionType<string>[] = [
  { label: "Option 1", value: "1" },
  { label: "Option 2", value: "2" },
  { label: "Option 3", value: "3" },
  { label: "Option 4", value: "4" },
];

const labelValueOptions: OptionType<string>[] = [
  { label: "Alpha", value: "a" },
  { label: "Beta", value: "b" },
  { label: "Gamma", value: "g" },
];

export const Default: Story = {
  args: {
    placeholder: "Select an option",
    options: basicOptions,
    className: "w-[200px]",
  },
};

export const Variants: Story = {
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: "color-contrast",
            enabled: false,
          },
        ],
      },
    },
  },
  render: (args: SelectPreviewArgs) => {
    return (
      <div className="flex w-[300px] flex-col gap-4">
        <SingleSelectPreview
          {...args}
          variant="outlined"
          placeholder="Outlined"
          options={basicOptions}
        />
        <SingleSelectPreview
          {...args}
          variant="filled"
          placeholder="Filled"
          options={basicOptions}
        />
        <SingleSelectPreview
          {...args}
          variant="borderless"
          placeholder="Borderless"
          options={basicOptions}
        />
      </div>
    );
  },
};

export const Sizes: Story = {
  render: (args: SelectPreviewArgs) => {
    return (
      <div className="flex w-[300px] flex-col gap-4">
        <SingleSelectPreview
          {...args}
          size="small"
          placeholder="Small"
          options={basicOptions}
        />
        <SingleSelectPreview
          {...args}
          size="middle"
          placeholder="Middle"
          options={basicOptions}
        />
        <SingleSelectPreview
          {...args}
          size="large"
          placeholder="Large"
          options={basicOptions}
        />
      </div>
    );
  },
};

export const Multiple: Story = {
  args: {
    mode: "multiple",
    placeholder: "Select multiple options",
    options: basicOptions,
    className: "w-[300px]",
  },
};

export const WithClear: Story = {
  args: {
    placeholder: "Select with clear button",
    options: basicOptions,
    allowClear: true,
    className: "w-[250px]",
  },
};

export const Loading: Story = {
  args: {
    placeholder: "Loading...",
    loading: true,
    options: basicOptions,
    className: "w-[200px]",
  },
};

export const Disabled: Story = {
  render: (args: SelectPreviewArgs) => {
    return (
      <div className="flex w-[300px] flex-col gap-4">
        <SingleSelectPreview
          {...args}
          disabled
          placeholder="Disabled"
          options={basicOptions}
        />
        <SingleSelectPreview
          {...args}
          disabled
          placeholder="Disabled with value"
          value="1"
          options={basicOptions}
        />
      </div>
    );
  },
};

export const Status: Story = {
  render: (args: SelectPreviewArgs) => {
    return (
      <div className="flex w-[300px] flex-col gap-4">
        <SingleSelectPreview
          {...args}
          status="error"
          placeholder="Error status"
          options={basicOptions}
        />
        <SingleSelectPreview
          {...args}
          status="warning"
          placeholder="Warning status"
          options={basicOptions}
        />
      </div>
    );
  },
};

export const Tags: Story = {
  args: {
    mode: "tags",
    placeholder: "Type to add tags",
    options: basicOptions,
    className: "w-[300px]",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step(
      "Empty tags input keeps the same left inset as Input",
      async () => {
        const input = canvas.getByPlaceholderText("Type to add tags");
        const styles = globalThis.getComputedStyle(input);
        const paddingLeft = Number.parseFloat(styles.paddingLeft);

        await expect(paddingLeft).toBeGreaterThanOrEqual(11);
        await expect(paddingLeft).toBeLessThanOrEqual(13);
      },
    );

    await step(
      "Type a custom tag and verify it appears as a selected option",
      async () => {
        const input = canvas.getByPlaceholderText("Type to add tags");

        await userEvent.click(input);
        await userEvent.type(input, "abc");

        await waitFor(async () => {
          await expect(input).toHaveValue("abc");
        });

        const customOption = screen.getByText("abc").closest("button");
        await expect(customOption).toHaveClass("bg-primary-100");
        await expect(customOption).toHaveClass("text-primary-600");
      },
    );

    await step(
      "Clicking an existing option does not create an extra custom tag from partial input",
      async () => {
        const input = canvas.getByPlaceholderText("Type to add tags");

        await userEvent.clear(input);
        await userEvent.type(input, "Op");
        await userEvent.click(screen.getByText("Option 1"));

        await waitFor(async () => {
          await expect(screen.queryByText("Op")).not.toBeInTheDocument();
        });
      },
    );
  },
};

export const TagsKeyboard: Story = {
  render: () => {
    const [value, setValue] = React.useState<string[]>([]);

    return (
      <div className="space-y-2">
        <Select<string>
          mode="tags"
          placeholder="Type to add tags"
          options={basicOptions}
          className="w-[300px]"
          value={value}
          onChange={(nextValue) => setValue(nextValue)}
        />
        <div data-testid="selected-values">{JSON.stringify(value)}</div>
      </div>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step(
      "Keyboard navigation can highlight and select the first option from a closed panel",
      async () => {
        const input = canvas.getByPlaceholderText("Type to add tags");

        await userEvent.click(input);
        await userEvent.keyboard("{Escape}");
        await expect(
          input.closest("[data-slot='popover-trigger']"),
        ).toHaveAttribute("aria-expanded", "false");

        await userEvent.keyboard("{ArrowDown}");

        const firstOption = screen.getByRole("button", { name: "Option 1" });
        await expect(firstOption).toHaveClass("bg-primary-100");
        await expect(firstOption).toHaveClass("text-primary-600");

        await userEvent.keyboard("{Enter}");

        await waitFor(async () => {
          await expect(canvas.getByTestId("selected-values")).toHaveTextContent(
            '["1"]',
          );
        });
      },
    );
  },
};

export const TagsLabelValue: Story = {
  render: () => {
    const [value, setValue] = React.useState<string[]>([]);

    return (
      <div className="space-y-2">
        <Select<string>
          mode="tags"
          placeholder="Type to add tags"
          options={labelValueOptions}
          className="w-[300px]"
          value={value}
          onChange={(nextValue) => setValue(nextValue)}
        />
        <div data-testid="selected-values">{JSON.stringify(value)}</div>
      </div>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step(
      "Submitting an exact label uses the existing option value",
      async () => {
        const input = canvas.getByPlaceholderText("Type to add tags");

        await userEvent.click(input);
        await userEvent.type(input, "Alpha{Enter}");

        await waitFor(async () => {
          await expect(canvas.getByTestId("selected-values")).toHaveTextContent(
            '["a"]',
          );
        });

        await expect(canvas.getByText("Alpha")).toBeInTheDocument();
        await expect(canvas.queryByText(/^a$/)).not.toBeInTheDocument();
      },
    );
  },
};

export const TagsBlurAfterClick: Story = {
  render: () => {
    const [value, setValue] = React.useState<string[]>([]);

    return (
      <div className="space-y-2">
        <Select<string>
          mode="tags"
          placeholder="Type to add tags"
          options={basicOptions}
          className="w-[300px]"
          value={value}
          onChange={(nextValue) => setValue(nextValue)}
        />
        <div data-testid="selected-values">{JSON.stringify(value)}</div>
        <button type="button" data-testid="outside-target">
          outside
        </button>
      </div>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step(
      "Blur still commits a custom tag after clicking an option",
      async () => {
        const input = canvas.getByPlaceholderText("Type to add tags");
        const outsideTarget = canvas.getByTestId("outside-target");

        await userEvent.click(input);
        await userEvent.click(screen.getByText("Option 1"));
        await userEvent.type(input, "xyz");
        await userEvent.click(outsideTarget);

        await waitFor(async () => {
          await expect(canvas.getByTestId("selected-values")).toHaveTextContent(
            '["1","xyz"]',
          );
        });
      },
    );
  },
};

export const TagsCustomOptionPersistence: Story = {
  render: () => {
    const [value, setValue] = React.useState<string[]>([]);

    return (
      <div className="space-y-2">
        <Select<string>
          mode="tags"
          placeholder="Type to add tags"
          options={basicOptions}
          className="w-[300px]"
          value={value}
          onChange={(nextValue) => setValue(nextValue)}
        />
        <div data-testid="selected-values">{JSON.stringify(value)}</div>
      </div>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step(
      "Created custom tags remain visible in the options panel after reopening",
      async () => {
        const input = canvas.getByPlaceholderText("Type to add tags");

        await userEvent.click(input);
        await userEvent.type(input, "xxx{Enter}");

        await waitFor(async () => {
          await expect(canvas.getByTestId("selected-values")).toHaveTextContent(
            '["xxx"]',
          );
        });

        await userEvent.click(input);
        const customOption = screen.getAllByRole("button", { name: "xxx" })[0];
        await expect(customOption).toBeInTheDocument();
        await expect(customOption).toHaveClass("bg-primary-100");
        await expect(customOption).toHaveClass("text-primary-600");
      },
    );
  },
};

export const TagsResubmitSelected: Story = {
  render: () => {
    const [value, setValue] = React.useState<string[]>(["xxx"]);

    return (
      <div className="space-y-2">
        <Select<string>
          mode="tags"
          placeholder="Type to add tags"
          options={basicOptions}
          className="w-[300px]"
          value={value}
          onChange={(nextValue) => setValue(nextValue)}
        />
        <div data-testid="selected-values">{JSON.stringify(value)}</div>
      </div>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step(
      "Submitting an already selected tag keeps it selected",
      async () => {
        const input = canvas.getByRole("textbox");

        await userEvent.click(input);
        await userEvent.type(input, "xxx{Enter}");

        await waitFor(async () => {
          await expect(canvas.getByTestId("selected-values")).toHaveTextContent(
            '["xxx"]',
          );
        });
      },
    );
  },
};

export const TagsArrowUpFromOpen: Story = {
  render: () => {
    const [value, setValue] = React.useState<string[]>([]);

    return (
      <div className="space-y-2">
        <Select<string>
          mode="tags"
          placeholder="Type to add tags"
          options={basicOptions}
          className="w-[300px]"
          value={value}
          onChange={(nextValue) => setValue(nextValue)}
        />
        <div data-testid="selected-values">{JSON.stringify(value)}</div>
      </div>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step(
      "ArrowUp from an open panel with no active option highlights the last option",
      async () => {
        const input = canvas.getByPlaceholderText("Type to add tags");

        await userEvent.click(input);
        await userEvent.keyboard("{ArrowUp}");

        const lastOption = screen.getByRole("button", { name: "Option 4" });
        await expect(lastOption).toHaveClass("bg-primary-100");
        await expect(lastOption).toHaveClass("text-primary-600");
      },
    );
  },
};

export const DisabledTags: Story = {
  args: {
    mode: "tags",
    placeholder: "Disabled tags",
    options: basicOptions,
    className: "w-[300px]",
    disabled: true,
    value: ["1"],
    allowClear: true,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Disabled tags input cannot be edited or opened", async () => {
      const input = canvas.getByRole("textbox");
      const trigger = input.closest("[data-slot='popover-trigger']");

      if (!(trigger instanceof HTMLElement)) {
        throw new TypeError("Disabled tags trigger not found");
      }

      await expect(input).toBeDisabled();
      fireEvent.click(trigger);
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
    });
  },
};
