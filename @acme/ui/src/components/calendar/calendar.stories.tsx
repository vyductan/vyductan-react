import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent } from "storybook/test";
import dayjs from "dayjs";

import { Calendar } from "./calendar";
import { Calendar as CalendarXor } from "./index";
import SizeDemo from "./examples/size";

const meta = {
  title: "Components/Calendar",
  component: Calendar,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState(dayjs());
    return (
      <Calendar
        mode="single"
        value={value}
        onSelect={(date) => setValue(date)}
      />
    );
  },
};

/**
 * Multi-select in two flavours:
 *
 * - **Basic** — the `Dayjs` value-based API. Adjacent selections stay separate
 *   (not merged into a range-like bar).
 * - **Series schedule** — mirrors the "Add Allotments to Series" modal: the
 *   `Date` (XOR) API with a `seriesWeekday` ring modifier and a custom square
 *   `classNames.day`. Verifies that adjacent selected days AND modifier rings
 *   read as separate boxes, and that a selected day fills its whole cell.
 */
export const Multiple: Story = {
  render: () => {
    const [value, setValue] = useState([
      dayjs("2024-06-05"),
      dayjs("2024-06-12"),
      dayjs("2024-06-20"),
    ]);
    const [series, setSeries] = useState<Date[]>([
      dayjs("2024-06-28").toDate(),
      dayjs("2024-06-29").toDate(),
    ]);
    return (
      <div className="flex flex-wrap items-start gap-10">
        <div data-testid="basic" className="space-y-2">
          <div className="text-muted-foreground text-sm">Basic</div>
          <Calendar
            mode="multiple"
            defaultMonth={dayjs("2024-06-01").toDate()}
            value={value}
            onSelect={(dates: dayjs.Dayjs[]) => setValue(dates)}
          />
        </div>
        <div data-testid="series" className="space-y-2">
          <div className="text-muted-foreground text-sm">Series schedule</div>
          <CalendarXor
            mode="multiple"
            fixedWeeks={false}
            selected={series}
            onSelect={(dates: Date[] | undefined) => setSeries(dates ?? [])}
            defaultMonth={dayjs("2024-06-01").toDate()}
            modifiers={{
              seriesWeekday: (date: Date) =>
                [14, 15, 28, 29, 30].includes(date.getDate()),
            }}
            modifiersClassNames={{
              seriesWeekday:
                "font-semibold border border-primary/30 rounded-md",
            }}
            className="p-1"
          />
        </div>
      </div>
    );
  },
  play: async ({ canvasElement, step }) => {
    const basic = canvasElement.querySelector<HTMLElement>(
      '[data-testid="basic"]',
    );
    if (!basic) throw new Error("Expected the basic multiple calendar");

    await step("initial dates are selected", async () => {
      await expect(
        basic.querySelectorAll('[data-day][aria-selected="true"]').length,
      ).toBe(3);
    });

    await step("clicking another day adds it to the selection", async () => {
      const day = basic.querySelector<HTMLButtonElement>(
        '[data-day="6/15/2024"]',
      );
      if (!day) throw new Error("Expected day button for 6/15/2024");
      await userEvent.click(day);
      await expect(
        basic.querySelectorAll('[data-day][aria-selected="true"]').length,
      ).toBe(4);
    });

    await step("clicking a selected day removes it", async () => {
      const day = basic.querySelector<HTMLButtonElement>(
        '[data-day="6/12/2024"]',
      );
      if (!day) throw new Error("Expected day button for 6/12/2024");
      await userEvent.click(day);
      await expect(
        basic.querySelectorAll('[data-day][aria-selected="true"]').length,
      ).toBe(3);
    });
  },
};

/**
 * Calendar has no `size` prop. Cell dimensions are driven by the `--cell-size`
 * CSS variable (default `--spacing(8)` = 32px). Override it via `className` to
 * get Ant Design-like small / middle / large sizing. See `examples/size.tsx`.
 */
export const Sizes: Story = {
  render: () => <SizeDemo />,
};
