import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import type { AgendaEvent, GanttItem } from "./index";
import { Agenda, Gantt } from "./index";

/**
 * Fixed dates, not `new Date()`.
 *
 * A story whose events are relative to now renders differently every run, and
 * the play functions below assert on geometry — the first Monday-morning run
 * after a Friday-afternoon one would fail for no reason.
 */
const MONDAY = new Date(2026, 0, 5);
const day = (offset: number, hour: number, minute = 0) =>
  new Date(2026, 0, 5 + offset, hour, minute);

const EVENTS: AgendaEvent[] = [
  { id: "1", title: "Standup", start: day(0, 9), end: day(0, 9, 30) },
  {
    id: "2",
    title: "Design review",
    start: day(0, 9),
    end: day(0, 11),
    color: "var(--color-purple-500)",
  },
  {
    id: "3",
    title: "Pairing on the agenda grid",
    start: day(0, 10),
    end: day(0, 12),
    color: "var(--color-blue-500)",
  },
  { id: "4", title: "Lunch", start: day(1, 12), end: day(1, 13) },
  {
    id: "5",
    title: "Overnight migration",
    start: day(2, 21),
    end: day(3, 8),
    color: "var(--color-orange-500)",
  },
  { id: "6", title: "Release day", start: day(4, 0), end: day(5, 0), allDay: true },
];

const meta = {
  title: "Components/Agenda",
  component: Agenda,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Agenda>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Week: Story = {
  args: { events: EVENTS, defaultDate: MONDAY },
};

export const Day: Story = {
  args: { events: EVENTS, defaultDate: MONDAY, defaultView: "day" },
};

/**
 * Monday's three morning events, as rendered geometry — the regression guard
 * for `layoutOverlaps` at the level that actually matters.
 *
 *   Standup       09:00–09:30  ┐ disjoint, so they share a column
 *   Pairing       10:00–12:00  ┘
 *   Design review 09:00–11:00    overlaps both, so it gets its own
 *
 * Two properties, and the second is the one a one-pass implementation breaks:
 * Standup is placed while the cluster is still one column wide, and must end up
 * HALF width once Design review widens it — not full width, sitting over its
 * neighbour.
 */
export const OverlapsSplitTheColumn: Story = {
  args: { events: EVENTS, defaultDate: MONDAY, defaultView: "day" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [standup, review, pairing] = await Promise.all(
      ["Standup", "Design review", "Pairing on the agenda grid"].map(
        async (title) => (await canvas.findByText(title)).closest("button")!,
      ),
    );

    const box = (element: HTMLElement) => element.getBoundingClientRect();
    const column = box(standup!.parentElement as HTMLElement);

    // Every block in the cluster is stamped with the cluster's final width.
    for (const block of [standup!, review!, pairing!]) {
      expect(box(block).width).toBeLessThan(column.width * 0.6);
      expect(box(block).width).toBeGreaterThan(column.width * 0.4);
    }

    // The one that overlaps both sits in its own column...
    expect(Math.round(box(review!).left)).not.toBe(
      Math.round(box(standup!).left),
    );
    // ...and the two disjoint ones reuse the same one.
    expect(Math.round(box(pairing!).left)).toBe(Math.round(box(standup!).left));

    // Vertical scale: 09:00–09:30 is half the height of 09:00–11:00's quarter
    // of the 07:00–22:00 window, i.e. the axis is linear in time.
    expect(box(review!).height / box(standup!).height).toBeCloseTo(4, 0);
  },
};

export const Empty: Story = {
  args: {
    events: [],
    defaultDate: MONDAY,
    empty: (
      <div className="text-muted-foreground rounded-lg border p-8 text-center text-sm">
        Nothing scheduled.
      </div>
    ),
  },
};

const GANTT_ITEMS: GanttItem[] = [
  {
    id: "a",
    title: "Spec the agenda",
    start: day(0, 9),
    end: day(2, 18),
    progress: 100,
    color: "var(--color-green-500)",
  },
  {
    id: "b",
    title: "Build the time grid",
    start: day(2, 9),
    end: day(6, 18),
    progress: 50,
    color: "var(--color-blue-500)",
    depth: 1,
  },
  {
    id: "c",
    title: "Overlap layout",
    start: day(3, 9),
    end: day(4, 18),
    progress: 85,
    color: "var(--color-orange-500)",
    depth: 2,
  },
  {
    id: "d",
    title: "Ship it",
    start: day(7, 9),
    end: day(7, 18),
    progress: 0,
  },
];

export const GanttView: StoryObj<typeof Gantt> = {
  render: () => <Gantt items={GANTT_ITEMS} />,
};

/** A single-day bar still has to be wide enough to hit. */
export const GanttSingleDayBarIsClickable: StoryObj<typeof Gantt> = {
  render: () => <Gantt items={GANTT_ITEMS} onItemClick={() => undefined} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = canvas
      .getAllByRole("button")
      .find((element) => element.title.startsWith("Ship it"));
    expect(bar).toBeTruthy();
    expect(bar!.getBoundingClientRect().width).toBeGreaterThanOrEqual(6);
  },
};
