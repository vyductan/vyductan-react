import type { Meta, StoryObj } from "@storybook/nextjs-vite";

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

const basicOptions: OptionType<string>[] = [
  { label: "Option 1", value: "1" },
  { label: "Option 2", value: "2" },
  { label: "Option 3", value: "3" },
  { label: "Option 4", value: "4" },
];

export const Default: Story = {
  args: {
    placeholder: "Select an option",
    options: basicOptions,
    className: "w-[200px]",
  },
};

export const Variants: Story = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render: (args: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { mode, value, defaultValue, options, ...rest } = args;
    return (
      <div className="flex w-[300px] flex-col gap-4">
        <Select
          {...rest}
          variant="outlined"
          placeholder="Outlined"
          options={basicOptions}
        />
        <Select
          {...rest}
          variant="filled"
          placeholder="Filled"
          options={basicOptions}
        />
        <Select
          {...rest}
          variant="borderless"
          placeholder="Borderless"
          options={basicOptions}
        />
      </div>
    );
  },
};

export const Sizes: Story = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render: (args: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { mode, value, defaultValue, options, ...rest } = args;
    return (
      <div className="flex w-[300px] flex-col gap-4">
        <Select
          {...rest}
          size="small"
          placeholder="Small"
          options={basicOptions}
        />
        <Select
          {...rest}
          size="middle"
          placeholder="Middle"
          options={basicOptions}
        />
        <Select
          {...rest}
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render: (args: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { mode, value, defaultValue, options, ...rest } = args;
    return (
      <div className="flex w-[300px] flex-col gap-4">
        <Select
          {...rest}
          disabled
          placeholder="Disabled"
          options={basicOptions}
        />
        <Select
          {...rest}
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render: (args: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { mode, value, defaultValue, options, ...rest } = args;
    return (
      <div className="flex w-[300px] flex-col gap-4">
        <Select
          {...rest}
          status="error"
          placeholder="Error status"
          options={basicOptions}
        />
        <Select
          {...rest}
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
};
