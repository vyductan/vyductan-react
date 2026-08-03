import type { Meta, StoryObj } from "@storybook/react-vite";
import dayjs from "dayjs";
import {
  expect,
  fireEvent,
  fn,
  userEvent,
  waitFor,
  within,
} from "storybook/test";

import { DatePicker } from "./date-picker";
import DisabledDateTimeDemo from "./examples/disabled-date-time";

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
    loading: {
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
  render: (arguments_) => (
    <div className="flex w-[240px] flex-col gap-4">
      <DatePicker {...arguments_} variant="outlined" placeholder="Outlined" />
      <DatePicker {...arguments_} variant="filled" placeholder="Filled" />
      <DatePicker
        {...arguments_}
        variant="borderless"
        placeholder="Borderless"
      />
    </div>
  ),
};

export const Sizes: Story = {
  render: (arguments_) => (
    <div className="flex w-[240px] flex-col gap-4">
      <DatePicker {...arguments_} size="small" placeholder="Small" />
      <DatePicker {...arguments_} size="middle" placeholder="Middle" />
      <DatePicker {...arguments_} size="large" placeholder="Large" />
    </div>
  ),
};

export const Status: Story = {
  render: (arguments_) => (
    <div className="flex w-[240px] flex-col gap-4">
      <DatePicker {...arguments_} status="error" placeholder="Error" />
      <DatePicker {...arguments_} status="warning" placeholder="Warning" />
    </div>
  ),
};

export const Loading: Story = {
  args: {
    placeholder: "Loading...",
    loading: true,
    className: "w-[240px]",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Loading...");

    await step("typing is blocked while loading", async () => {
      await userEvent.type(input, "2024-01-01");
      await expect(input).toHaveValue("");
    });

    await step("clicking does not open the calendar", async () => {
      await userEvent.click(input);
      await expect(
        document.querySelector('[data-slot="calendar"]'),
      ).toBeNull();
    });
  },
};

export const WithDayModifiers: Story = {
  args: {
    placeholder: "Has-slots demo",
    defaultValue: dayjs("2024-06-10"),
    className: "w-[240px]",
    modifiers: {
      hasSlots: [dayjs("2024-06-12").toDate(), dayjs("2024-06-18").toDate()],
    },
    modifiersClassNames: {
      hasSlots:
        "relative after:absolute after:bottom-1.5 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-green-500 after:content-[''] font-medium",
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("marked days render the modifier class when open", async () => {
      await userEvent.click(canvas.getByPlaceholderText("Has-slots demo"));
      await expect(
        document.querySelector('[class*="after:bg-green-500"]'),
      ).not.toBeNull();
    });
  },
};

export const PickerModes: Story = {
  render: (arguments_) => (
    <div className="flex w-[240px] flex-col gap-4">
      <DatePicker {...arguments_} picker="date" placeholder="Date Picker" />
      <DatePicker
        {...arguments_}
        picker="week"
        placeholder="Week Picker"
        defaultValue={dayjs("2024-05-15")}
      />
      <DatePicker {...arguments_} picker="month" placeholder="Month Picker" />
      <DatePicker
        {...arguments_}
        picker="quarter"
        placeholder="Quarter Picker"
        defaultValue={dayjs("2024-08-15")}
      />
      <DatePicker {...arguments_} picker="year" placeholder="Year Picker" />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Week picker previews and commits week start", async () => {
      const input = canvas.getByPlaceholderText("Week Picker");
      await userEvent.click(input);

      const day = document.querySelector<HTMLButtonElement>(
        '[data-day="5/16/2024"]',
      );
      await expect(day).toBeTruthy();
      if (!day) {
        throw new Error("Expected day button for 5/16/2024");
      }
      await userEvent.hover(day);
      await expect(input).toHaveValue("2024-05-12");

      const currentDay = document.querySelector<HTMLButtonElement>(
        '[data-day="5/16/2024"]',
      );
      await expect(currentDay).toBeTruthy();
      if (!currentDay) {
        throw new Error("Expected current day button for 5/16/2024");
      }
      await userEvent.click(currentDay);
      await userEvent.click(document.body);

      await expect(input).toHaveValue("2024-05-12");
    });

    await step("Quarter picker commits quarter start", async () => {
      const input = canvas.getByPlaceholderText("Quarter Picker");
      await userEvent.click(input);

      const monthButton = await within(document.body).findByRole("button", {
        name: "Aug",
      });
      await userEvent.click(monthButton);

      const mayOption = [
        ...document.querySelectorAll<HTMLElement>("[role='button']"),
      ].find((element) => element.textContent?.trim() === "May");
      await expect(mayOption).toBeTruthy();
      if (!mayOption) {
        throw new Error('Expected month option "May"');
      }
      await userEvent.hover(mayOption);

      const currentMayOption = [
        ...document.querySelectorAll<HTMLElement>("[role='button']"),
      ].find((element) => element.textContent?.trim() === "May");
      await expect(currentMayOption).toBeTruthy();
      if (!currentMayOption) {
        throw new Error('Expected current month option "May"');
      }
      fireEvent.mouseDown(currentMayOption);
      await userEvent.click(document.body);

      await expect(input).toHaveValue("2024-Q2");
    });
  },
};

export const WithTime: Story = {
  args: {
    showTime: true,
    defaultValue: dayjs("2024-06-10 09:30"),
    placeholder: "Select date & time",
    className: "w-[240px]",
    onChange: fn(),
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Select date & time");

    await step("time column is rendered when panel opens", async () => {
      await userEvent.click(input);
      await expect(
        document.querySelector('[data-slot="picker-time"]'),
      ).not.toBeNull();
    });

    await step("picking a day keeps the panel open and preserves time", async () => {
      const day = document.querySelector<HTMLButtonElement>(
        '[data-day="6/15/2024"]',
      );
      if (!day) throw new Error("Expected day button for 6/15/2024");
      await userEvent.click(day);
      // Move the mouse off the day so the input shows the committed value
      // instead of the hover preview.
      await userEvent.unhover(day);

      // Panel must stay open (regression: previously closed immediately).
      await expect(
        document.querySelector('[data-slot="picker-time"]'),
      ).not.toBeNull();
      // Default showTime shows seconds (AntD parity): HH:mm:ss.
      await expect(input).toHaveValue("2024-06-15 09:30:00");
    });

    await step("Ok closes the panel", async () => {
      await userEvent.click(
        within(document.body).getByRole("button", { name: "Ok" }),
      );
      await waitFor(() =>
        expect(
          document.querySelector('[data-slot="picker-time"]'),
        ).toBeNull(),
      );
    });
  },
};

export const WithTimeDefaultOpen: Story = {
  args: {
    showTime: { defaultOpenValue: dayjs("08:15:00", "HH:mm:ss") },
    format: "YYYY-MM-DD HH:mm:ss",
    placeholder: "Pick date & time",
    className: "w-[240px]",
    onChange: fn(),
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Pick date & time");

    await step(
      "picking a day on an empty picker applies defaultOpenValue time",
      async () => {
        await userEvent.click(input);
        // Any enabled in-grid day; only the applied time is asserted.
        const day = [
          ...document.querySelectorAll<HTMLButtonElement>("button[data-day]"),
        ].filter((b) => !b.disabled)[15];
        if (!day) throw new Error("Expected an enabled day button");
        await userEvent.click(day);
        await expect((input as HTMLInputElement).value).toMatch(/ 08:15:00$/);
      },
    );
  },
};

export const WithTimeForwardedOptions: Story = {
  args: {
    showTime: { format: "HH:mm", showNow: false, minuteStep: 15 },
    format: "YYYY-MM-DD HH:mm",
    defaultValue: dayjs("2024-06-10 09:30"),
    placeholder: "Forwarded showTime opts",
    className: "w-[240px]",
    onChange: fn(),
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByPlaceholderText("Forwarded showTime opts"),
    );

    await step("format hides the seconds column", async () => {
      const panel = document.querySelector('[data-slot="picker-time"]');
      if (!panel) throw new Error("Expected time panel");
      await expect(panel.querySelectorAll("ul")).toHaveLength(2);
    });

    await step("showNow:false hides the Now button", async () => {
      await expect(
        within(document.body).queryByRole("button", { name: "Now" }),
      ).toBeNull();
    });

    await step("minuteStep:15 steps the minute column", async () => {
      const cols = document
        .querySelector('[data-slot="picker-time"]')!
        .querySelectorAll("ul");
      const minutes = [...cols[1]!.querySelectorAll("li")].map(
        (li) => li.textContent,
      );
      await expect(minutes).toContain("15");
      await expect(minutes).not.toContain("14");
    });
  },
};

export const WithTime12Hours: Story = {
  args: {
    showTime: { use12Hours: true },
    defaultValue: dayjs("2024-06-10 14:30:00"),
    placeholder: "12-hour time",
    className: "w-[260px]",
    onChange: fn(),
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("12-hour time");

    await step("input renders 12h time with meridiem", async () => {
      await expect(input).toHaveValue("2024-06-10 02:30:00 PM");
    });

    await userEvent.click(input);

    await step("panel adds an AM/PM column, PM selected for 14:30", async () => {
      const panel = document.querySelector('[data-slot="picker-time"]');
      if (!panel) throw new Error("Expected time panel");
      const cols = panel.querySelectorAll("ul");
      // hour, minute, second, meridiem
      await expect(cols).toHaveLength(4);
      const meridiem = [...cols[3]!.querySelectorAll("li")].map(
        (li) => li.textContent,
      );
      await expect(meridiem).toEqual(["AM", "PM"]);
      const selectedMeridiem = [...cols[3]!.querySelectorAll("li")].find((li) =>
        li.className.includes("bg-primary-200"),
      );
      await expect(selectedMeridiem?.textContent).toBe("PM");
    });
  },
};

export const DisabledDateTime: Story = {
  render: () => <DisabledDateTimeDemo />,
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
      const monthButton = within(document.body).getByRole("button", {
        name: "May",
      });
      await userEvent.click(monthButton);

      // Verify month grid is visible
      // We can look for 'Jan', 'Feb' etc.
      const jan = within(document.body).getByText("Jan");
      await expect(jan).toBeTruthy();
    });

    await step("Select 'Sep'", async () => {
      const separator = within(document.body).getByText("Sep");
      await userEvent.click(separator);

      // Verify we are back to date view and showing Sep
      const monthButton = within(document.body).getByRole("button", {
        name: "Sep",
      });
      await expect(monthButton).toBeTruthy();
    });
  },
};
