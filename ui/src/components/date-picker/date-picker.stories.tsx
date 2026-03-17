import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import dayjs from "dayjs";
import { expect, fn, userEvent, within } from "storybook/test";

import { DatePicker } from "./date-picker";

const meta = {
  title: "Components/DatePicker",
  component: DatePicker,
  parameters: {
    layout: "centered",
    a11y: {
      config: {
        rules: [
          {
            id: "aria-valid-attr-value",
            enabled: false,
          },
        ],
      },
    },
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
    picker: {
      control: "select",
      options: ["date", "week", "month", "quarter", "year"],
    },
    placeholder: {
      control: "text",
    },
    showTime: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Select date",
    className: "w-[240px]",
    onChange: fn(),
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: dayjs("2024-01-01"),
    className: "w-[240px]",
  },
};

export const Variants: Story = {
  render: (args) => (
    <div className="flex w-[240px] flex-col gap-4">
      <DatePicker {...args} variant="outlined" placeholder="Outlined" />
      <DatePicker {...args} variant="filled" placeholder="Filled" />
      <DatePicker {...args} variant="borderless" placeholder="Borderless" />
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex w-[240px] flex-col gap-4">
      <DatePicker {...args} size="small" placeholder="Small" />
      <DatePicker {...args} size="middle" placeholder="Middle" />
      <DatePicker {...args} size="large" placeholder="Large" />
    </div>
  ),
};

export const Status: Story = {
  render: (args) => (
    <div className="flex w-[240px] flex-col gap-4">
      <DatePicker {...args} status="error" placeholder="Error" />
      <DatePicker {...args} status="warning" placeholder="Warning" />
    </div>
  ),
};

export const PickerModes: Story = {
  render: (args) => (
    <div className="flex w-[240px] flex-col gap-4">
      <DatePicker {...args} picker="date" placeholder="Date Picker" />
      <DatePicker {...args} picker="week" placeholder="Week Picker" />
      <DatePicker {...args} picker="month" placeholder="Month Picker" />
      <DatePicker {...args} picker="quarter" placeholder="Quarter Picker" />
      <DatePicker {...args} picker="year" placeholder="Year Picker" />
    </div>
  ),
};

export const WithTime: Story = {
  args: {
    showTime: true,
    placeholder: "Select date & time",
    className: "w-[240px]",
  },
};

export const InteractionOpenCalendar: Story = {
  args: {
    placeholder: "Click to open",
    className: "w-[240px]",
    onChange: fn(),
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Click input to open calendar", async () => {
      const input = canvas.getByPlaceholderText("Click to open");
      await userEvent.click(input);

      // Verify popover content appears (checking for a known calendar element or just presence)
      // Note: Popover renders in portal, so it might not be in canvasElement but document.body
      // storybook/test 'within' might not see portals effectively unless target is body.
      // However, we can check if input has attribute that indicates open state if any,
      // or try to find by role "dialog" or similar in document.
      const calendar = document.querySelector('[data-slot="calendar"]');
      await expect(calendar).toBeTruthy();
    });
  },
};

export const InteractionMonthSelection: Story = {
  args: {
    placeholder: "Select Month via Header",
    className: "w-[240px]",
    defaultValue: dayjs("2024-05-15"), // Start with May 2024
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Open calendar", async () => {
      const input = canvas.getByPlaceholderText("Select Month via Header");
      await userEvent.click(input);
    });

    await step("Switch to month picker", async () => {
      // Find the month button (it displays 'May')
      // Since it's in a portal, we search in document body
      const monthBtn = within(document.body).getByRole("button", {
        name: "May",
      });
      await userEvent.click(monthBtn);

      // Verify month grid is visible
      // We can look for 'Jan', 'Feb' etc.
      const jan = within(document.body).getByText("Jan");
      await expect(jan).toBeTruthy();
    });

    await step("Select 'Sep'", async () => {
      const sep = within(document.body).getByText("Sep");
      await userEvent.click(sep);

      // Verify we are back to date view and showing Sep
      const monthBtn = within(document.body).getByRole("button", {
        name: "Sep",
      });
      await expect(monthBtn).toBeTruthy();
    });
  },
};
