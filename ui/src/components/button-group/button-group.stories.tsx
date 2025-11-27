import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";

import { Button } from "../button/button";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "./index";

const meta = {
  title: "Components/ButtonGroup",
  component: ButtonGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
    },
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <Button>Button 1</Button>
      <Button>Button 2</Button>
      <Button>Button 3</Button>
    </ButtonGroup>
  ),
};

export const Vertical: Story = {
  args: {
    orientation: "vertical",
  },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button>Button 1</Button>
      <Button>Button 2</Button>
      <Button>Button 3</Button>
    </ButtonGroup>
  ),
};

export const WithSeparator: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <Button>Left</Button>
      <ButtonGroupSeparator />
      <Button>Right</Button>
    </ButtonGroup>
  ),
};

export const WithText: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <Button>Action</Button>
      <ButtonGroupText>Or</ButtonGroupText>
      <Button variant="outlined">Alternative</Button>
    </ButtonGroup>
  ),
};

export const Toolbar: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <ButtonGroup {...args}>
        <Button variant="outlined">Copy</Button>
        <Button variant="outlined">Paste</Button>
        <Button variant="outlined">Cut</Button>
      </ButtonGroup>

      <ButtonGroup {...args}>
        <Button variant="solid" color="primary">
          Save
        </Button>
        <ButtonGroupSeparator />
        <Button variant="solid" color="danger">
          Delete
        </Button>
      </ButtonGroup>
    </div>
  ),
};

// Interaction Testing - Test clicking buttons in a group
export const InteractionTest: Story = {
  render: (args) => {
    const handleCopy = fn();
    const handlePaste = fn();
    const handleCut = fn();

    return (
      <ButtonGroup {...args}>
        <Button variant="outlined" onClick={handleCopy}>
          Copy
        </Button>
        <Button variant="outlined" onClick={handlePaste}>
          Paste
        </Button>
        <Button variant="outlined" onClick={handleCut}>
          Cut
        </Button>
      </ButtonGroup>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Verify all buttons are rendered", async () => {
      const copyButton = canvas.getByRole("button", { name: /copy/i });
      const pasteButton = canvas.getByRole("button", { name: /paste/i });
      const cutButton = canvas.getByRole("button", { name: /cut/i });

      await expect(copyButton).toBeInTheDocument();
      await expect(pasteButton).toBeInTheDocument();
      await expect(cutButton).toBeInTheDocument();
    });

    await step("Click each button in sequence", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /copy/i }));
      await userEvent.click(canvas.getByRole("button", { name: /paste/i }));
      await userEvent.click(canvas.getByRole("button", { name: /cut/i }));
    });
  },
};

// Interaction Testing - Test button group with separator
export const InteractionWithSeparator: Story = {
  render: (args) => {
    const handleSave = fn();
    const handleDelete = fn();

    return (
      <ButtonGroup {...args}>
        <Button variant="solid" color="primary" onClick={handleSave}>
          Save
        </Button>
        <ButtonGroupSeparator />
        <Button variant="solid" color="danger" onClick={handleDelete}>
          Delete
        </Button>
      </ButtonGroup>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Verify buttons and separator", async () => {
      const saveButton = canvas.getByRole("button", { name: /save/i });
      const deleteButton = canvas.getByRole("button", { name: /delete/i });

      await expect(saveButton).toBeInTheDocument();
      await expect(deleteButton).toBeInTheDocument();
    });

    await step("Click Save button", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /save/i }));
    });

    await step("Click Delete button", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /delete/i }));
    });
  },
};
