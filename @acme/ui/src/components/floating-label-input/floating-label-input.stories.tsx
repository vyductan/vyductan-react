import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { FloatingLabelInput } from "./floating-label-input";
import { FloatingLabelSelect } from "./floating-label-select";
import { FloatingLabelTextarea } from "./floating-label-textarea";

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

/** md (56px) vs sm (48px), side by side. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-5">
      <FloatingLabelInput label="Medium (md)" size="md" defaultValue="hello" />
      <FloatingLabelInput label="Compact (sm)" size="sm" defaultValue="hello" />
    </div>
  ),
};

/** Textarea + Select share the same outlined look, sizes and required mark. */
export const Textarea: Story = {
  render: () => (
    <div className="flex flex-col gap-5">
      <FloatingLabelTextarea label="Message" required />
      <FloatingLabelTextarea
        label="Bio"
        size="sm"
        defaultValue="Prefilled content floats the label."
      />
      <FloatingLabelTextarea
        label="Notes"
        status="error"
        defaultValue="Something invalid"
      />
    </div>
  ),
};

export const Select: Story = {
  render: () => (
    <div className="flex flex-col gap-5">
      <FloatingLabelSelect label="Country" required>
        <option value="vn">Vietnam</option>
        <option value="us">United States</option>
        <option value="jp">Japan</option>
      </FloatingLabelSelect>
      <FloatingLabelSelect label="Plan (sm)" size="sm" defaultValue="pro">
        <option value="free">Free</option>
        <option value="pro">Pro</option>
        <option value="team">Team</option>
      </FloatingLabelSelect>
      <FloatingLabelSelect label="Role" status="error">
        <option value="admin">Admin</option>
        <option value="user">User</option>
      </FloatingLabelSelect>
    </div>
  ),
};

/** Everything together, as it would look on a form. */
export const Showcase: Story = {
  render: () => (
    <div className="flex w-[360px] flex-col gap-5">
      <FloatingLabelInput label="Full name" required />
      <FloatingLabelInput label="Email" type="email" defaultValue="a@b.com" />
      <FloatingLabelSelect label="Country" required>
        <option value="vn">Vietnam</option>
        <option value="us">United States</option>
      </FloatingLabelSelect>
      <FloatingLabelTextarea label="Message" size="sm" />
    </div>
  ),
};

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
