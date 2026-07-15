import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { FloatingLabelInput } from "./floating-label-input";
import { FloatingLabelSelect } from "./floating-label-select";
import BasicExample from "./examples/basic";
import SelectExample from "./examples/select";
import ShowcaseExample from "./examples/showcase";
import SizesExample from "./examples/sizes";
import TextareaExample from "./examples/textarea";

const meta = {
  title: "Components/FloatingLabelInput",
  component: FloatingLabelInput,
  parameters: {
    layout: "centered",
  },
  args: {
    label: "Outlined",
  },
  argTypes: {
    status: { control: "radio", options: ["default", "error"] },
    size: { control: "radio", options: ["md", "sm"] },
    required: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div className="w-[320px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FloatingLabelInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---- arg-driven playground stories (direct component) ----

export const Default: Story = {};

export const Filled: Story = {
  args: { defaultValue: "hello" },
};

export const Compact: Story = {
  args: { label: "Compact (sm)", size: "sm" },
};

export const Required: Story = {
  args: { label: "Full name", required: true },
};

export const Error: Story = {
  args: { label: "Email", defaultValue: "not-an-email", status: "error" },
};

export const Disabled: Story = {
  args: { label: "Disabled", defaultValue: "read only", disabled: true },
};

// ---- composite demos (see ./examples) ----

export const Basic: Story = { render: () => <BasicExample /> };
export const Sizes: Story = { render: () => <SizesExample /> };
export const Textarea: Story = { render: () => <TextareaExample /> };
export const Select: Story = { render: () => <SelectExample /> };
export const Showcase: Story = { render: () => <ShowcaseExample /> };

// ---- interaction tests ----

export const TypingFloatsLabel: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Outlined");

    await step("empty -> label rests as placeholder", async () => {
      await expect(input).toHaveValue("");
    });

    await step("type -> value commits, label floats", async () => {
      await userEvent.type(input, "hello");
      await expect(input).toHaveValue("hello");
      await expect(input).not.toHaveDisplayValue("");
    });
  },
};

export const SelectFloatsOnChoice: Story = {
  render: () => (
    <FloatingLabelSelect label="Country" aria-label="Country">
      <option value="vn">Vietnam</option>
      <option value="us">United States</option>
    </FloatingLabelSelect>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByLabelText("Country");

    await step("empty by default", async () => {
      await expect(select).toHaveValue("");
    });

    await step("choose an option -> value set (label floats)", async () => {
      await userEvent.selectOptions(select, "us");
      await expect(select).toHaveValue("us");
    });
  },
};
