import React from "react";

import "@testing-library/jest-dom/vitest";

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import dayjs from "dayjs";
import { afterEach, describe, expect, test, vi } from "vitest";

import { DatePicker } from "./date-picker";
import { DateRangePicker } from "./date-range-picker";

globalThis.React = React;

globalThis.ResizeObserver ??= class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

type RangePickerProperties = React.ComponentProps<typeof DateRangePicker> & {
  disabledTime?: (
    date: dayjs.Dayjs | null,
    type: "start" | "end",
  ) => {
    disabledHours?: () => number[];
  };
};

const RangePicker =
  DateRangePicker as React.ComponentType<RangePickerProperties>;

afterEach(() => {
  cleanup();
});

describe("DatePicker classNames", () => {
  test("forwards each semantic slot to the element it names", () => {
    render(
      <DatePicker
        defaultValue={dayjs("2024-06-15")}
        className="root-from-className"
        classNames={{
          root: "root-from-classNames",
          input: "input-slot",
          suffix: "suffix-slot",
        }}
        styles={{
          root: { marginTop: "4px" },
          input: { color: "rgb(1, 2, 3)" },
        }}
      />,
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("input-slot");
    expect(input).toHaveStyle({ color: "rgb(1, 2, 3)" });

    const root = document.querySelector('[data-slot="picker-input"]');
    expect(root).toHaveClass("root-from-className", "root-from-classNames");
    expect(root).toHaveStyle({ marginTop: "4px" });

    expect(document.querySelector(".suffix-slot")).toBeTruthy();
  });

  test("classNames.input does not clobber the component's own input classes", () => {
    render(
      <DatePicker
        defaultValue={dayjs("2024-06-15")}
        classNames={{ input: "input-slot" }}
      />,
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("input-slot");
    // Base styling from Input survives the merge.
    expect(input).toHaveClass("text-foreground");
  });
});

describe("DateRangePicker classNames", () => {
  test("forwards shared and per-field slots to the right inputs", () => {
    render(
      <DateRangePicker
        defaultValue={[dayjs("2024-06-15"), dayjs("2024-06-20")]}
        className="root-from-className"
        classNames={{
          root: "root-from-classNames",
          input: "both-slot",
          start: "start-slot",
          end: "end-slot",
          suffix: "suffix-slot",
        }}
        styles={{
          root: { marginTop: "4px" },
          input: { letterSpacing: "1px" },
          end: { color: "rgb(1, 2, 3)" },
        }}
      />,
    );

    const [start, end] = screen.getAllByRole("textbox");
    if (!start || !end) throw new Error("Expected both range inputs");

    expect(start).toHaveClass("both-slot", "start-slot");
    expect(start).not.toHaveClass("end-slot");
    expect(end).toHaveClass("both-slot", "end-slot");
    expect(end).not.toHaveClass("start-slot");

    // Shared `input` style applies to both; `end` narrows to one field.
    expect(start).toHaveStyle({ letterSpacing: "1px" });
    expect(end).toHaveStyle({ letterSpacing: "1px", color: "rgb(1, 2, 3)" });

    const root = document.querySelector('[data-slot="picker-input"]');
    expect(root).toHaveClass("root-from-className", "root-from-classNames");
    expect(root).toHaveStyle({ marginTop: "4px" });

    expect(document.querySelector(".suffix-slot")).toBeTruthy();
  });
});

describe("DateRangePicker prop routing", () => {
  test("renders a custom suffix once, beside the fields rather than inside each", () => {
    render(
      <DateRangePicker suffix={<span data-testid="range-suffix">S</span>} />,
    );

    // Regression: `{...rest}` was spread onto both <Input>s, so a suffix
    // rendered twice — once inside each field.
    expect(screen.getAllByTestId("range-suffix")).toHaveLength(1);
  });

  test("does not leak picker-level props onto the input elements", () => {
    render(<DateRangePicker defaultValue={[dayjs("2024-06-15"), null]} />);

    for (const input of screen.getAllByRole("textbox")) {
      expect(input).not.toHaveAttribute("modifiers");
      expect(input).not.toHaveAttribute("captionlayout");
      expect(input).not.toHaveAttribute("commityearonclose");
    }
  });
});

describe("DatePicker period validation", () => {
  test("rejects month selection when any day in the month is before minDate", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <DatePicker
        picker="month"
        defaultValue={dayjs("2024-06-15")}
        minDate={dayjs("2024-05-10")}
        onChange={onChange}
      />,
    );

    const input = screen.getByRole("textbox");

    await user.click(input);
    await user.click(await screen.findByRole("button", { name: "Jun" }));
    await user.click(await screen.findByText("May"));

    expect(onChange).not.toHaveBeenCalled();
    await user.click(document.body);

    await waitFor(() => {
      expect(input).toHaveValue("2024-06-15");
    });
  });

  test("rejects year selection when any day in the year is after maxDate", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <DatePicker
        picker="year"
        defaultValue={dayjs("2025-05-15")}
        maxDate={dayjs("2024-10-01")}
        onChange={onChange}
      />,
    );

    const input = screen.getByRole("textbox");

    await user.click(input);
    await user.click(await screen.findByRole("button", { name: "2025" }));
    await user.click(await screen.findByText("2024"));

    expect(onChange).not.toHaveBeenCalled();
    await user.click(document.body);

    await waitFor(() => {
      expect(input).toHaveValue("2025");
    });
  });

  test("commits the start of the selected week", async () => {
    const user = userEvent.setup();

    render(<DatePicker picker="week" defaultValue={dayjs("2024-05-15")} />);

    const input = screen.getByRole("textbox");

    await user.click(input);

    const selectedDay = document.querySelector<HTMLButtonElement>(
      '[data-day="5/16/2024"]',
    );

    expect(selectedDay).toBeTruthy();
    if (!selectedDay) {
      throw new Error("Expected day button for 5/16/2024");
    }
    expect(selectedDay).not.toHaveAttribute("disabled");

    await user.hover(selectedDay);

    await waitFor(() => {
      expect(input).toHaveValue("2024-05-12");
    });

    const currentSelectedDay = document.querySelector<HTMLButtonElement>(
      '[data-day="5/16/2024"]',
    );

    expect(currentSelectedDay).toBeTruthy();
    if (!currentSelectedDay) {
      throw new Error("Expected current day button for 5/16/2024");
    }
    await user.click(currentSelectedDay);
    await user.click(document.body);

    await waitFor(() => {
      expect(input).toHaveValue("2024-05-12");
    });
  });

  test("commits the start of the selected quarter", async () => {
    const user = userEvent.setup();

    render(<DatePicker picker="quarter" defaultValue={dayjs("2024-08-15")} />);

    const input = screen.getByRole("textbox");

    await user.click(input);
    await user.click(await screen.findByRole("button", { name: "Aug" }));

    const mayOption = [
      ...document.querySelectorAll<HTMLElement>("[role='button']"),
    ].find((element) => element.textContent?.trim() === "May");
    expect(mayOption).toBeTruthy();
    if (!mayOption) {
      throw new Error('Expected month option "May"');
    }

    await user.hover(mayOption);

    const currentMayOption = [
      ...document.querySelectorAll<HTMLElement>("[role='button']"),
    ].find((element) => element.textContent?.trim() === "May");
    expect(currentMayOption).toBeTruthy();
    if (!currentMayOption) {
      throw new Error('Expected current month option "May"');
    }

    fireEvent.mouseDown(currentMayOption);
    await user.click(document.body);

    await waitFor(() => {
      expect(input).toHaveValue("2024-Q2");
    });
  });

  test("rejects quarter selection when any day in the quarter is before minDate", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <DatePicker
        picker="quarter"
        defaultValue={dayjs("2024-08-15")}
        minDate={dayjs("2024-05-10")}
        onChange={onChange}
      />,
    );

    const input = screen.getByRole("textbox");

    await user.click(input);
    await user.click(await screen.findByRole("button", { name: "Aug" }));
    await user.click(await screen.findByRole("button", { name: "May" }));

    expect(onChange).not.toHaveBeenCalled();
    await user.click(document.body);

    await waitFor(() => {
      expect(input).toHaveValue("2024-Q3");
    });
  });

  test("marks disabled calendar days with disabled cursor and aria state", async () => {
    const user = userEvent.setup();

    render(
      <DatePicker
        defaultValue={dayjs("2026-05-05")}
        disabledDate={(current) => current.isSame(dayjs("2026-05-06"), "day")}
      />,
    );

    await user.click(screen.getByRole("textbox"));

    const day = document.querySelector<HTMLButtonElement>(
      '[data-day="5/6/2026"]',
    );

    expect(day).toBeTruthy();
    if (!day) {
      throw new Error("Expected disabled day button for 5/6/2026");
    }
    expect(day).toBeDisabled();
    expect(day).toHaveAttribute("aria-disabled", "true");
    expect(day).toHaveClass("cursor-not-allowed");
    expect(day).toHaveClass("disabled:pointer-events-auto");
  });

  test("marks disabled month options with disabled cursor and aria state", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <DatePicker
        picker="month"
        defaultValue={dayjs("2024-06-15")}
        minDate={dayjs("2024-05-10")}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("textbox"));
    await user.click(await screen.findByRole("button", { name: "Jun" }));

    const mayOption = await screen.findByRole("button", { name: "May" });

    expect(mayOption).toHaveAttribute("aria-disabled", "true");
    expect(mayOption).toHaveAttribute("tabindex", "-1");
    expect(mayOption).toHaveClass("cursor-not-allowed");

    await user.click(mayOption);

    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("DatePicker disabled time validation", () => {
  test("rejects typed values with disabled time when showTime is enabled", async () => {
    const onChange = vi.fn();
    render(
      <DatePicker
        showTime
        format="YYYY-MM-DD HH:mm"
        onChange={onChange}
        disabledTime={() => ({
          disabledHours: () => [10],
        })}
      />,
    );

    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "2024-05-15 10:30" } });
    fireEvent.keyUp(input, { key: "Enter" });

    expect(onChange).not.toHaveBeenCalled();
  });

  test("ignores disabledTime without showTime", async () => {
    const onChange = vi.fn();
    render(
      <DatePicker
        format="YYYY-MM-DD HH:mm"
        onChange={onChange}
        disabledTime={() => ({
          disabledHours: () => [10],
        })}
      />,
    );

    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "2024-05-15 10:30" } });
    fireEvent.keyUp(input, { key: "Enter" });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({}),
        "2024-05-15 10:30",
      );
    });
  });

  test("keeps calendar dates enabled when disabledTime only disables midnight", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <DatePicker
        showTime
        format="YYYY-MM-DD HH:mm"
        defaultValue={dayjs("2026-05-05 03:00")}
        onChange={onChange}
        disabledTime={() => ({
          disabledHours: () => [0],
        })}
      />,
    );

    await user.click(screen.getByRole("textbox"));

    const day = document.querySelector<HTMLButtonElement>(
      '[data-day="5/6/2026"]',
    );

    expect(day).toBeTruthy();
    if (!day) {
      throw new Error("Expected day button for 5/6/2026");
    }
    expect(day).not.toBeDisabled();

    await user.hover(day);

    const currentDay = document.querySelector<HTMLButtonElement>(
      '[data-day="5/6/2026"]',
    );

    expect(currentDay).toBeTruthy();
    if (!currentDay) {
      throw new Error("Expected current day button for 5/6/2026");
    }
    await user.click(currentDay);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
  });

  test("rejects range start values blocked by disabledDate", async () => {
    const onChange = vi.fn();

    render(
      <RangePicker
        format="YYYY-MM-DD"
        onChange={onChange}
        disabledDate={(current: dayjs.Dayjs) =>
          current.isSame(dayjs("2024-05-15"), "day")
        }
      />,
    );

    const startInput = screen.getAllByRole("textbox")[0];
    expect(startInput).toBeTruthy();
    if (!startInput) {
      throw new Error("Expected range start input");
    }

    fireEvent.change(startInput, { target: { value: "2024-05-15" } });
    fireEvent.keyUp(startInput, { key: "Enter" });

    expect(onChange).not.toHaveBeenCalled();
  });

  test("rejects range end values blocked by disabledTime when showTime is enabled", async () => {
    const onChange = vi.fn();

    render(
      <RangePicker
        showTime={{
          defaultOpenValue: [
            dayjs("00:00:00", "HH:mm:ss"),
            dayjs("11:59:59", "HH:mm:ss"),
          ],
        }}
        format="YYYY-MM-DD HH:mm:ss"
        onChange={onChange}
        disabledTime={(_date: dayjs.Dayjs | null, type: "start" | "end") => ({
          disabledHours: () => (type === "end" ? [22] : []),
        })}
      />,
    );

    const endInput = screen.getAllByRole("textbox")[1];
    expect(endInput).toBeTruthy();
    if (!endInput) {
      throw new Error("Expected range end input");
    }

    fireEvent.change(endInput, {
      target: { value: "2024-05-15 22:30:00" },
    });
    fireEvent.keyUp(endInput, { key: "Enter" });

    expect(onChange).not.toHaveBeenCalled();
  });

  test("rejects swapped range values when the final boundary has disabled time", async () => {
    const onChange = vi.fn();

    render(
      <RangePicker
        showTime
        format="YYYY-MM-DD HH:mm:ss"
        defaultValue={[
          dayjs("2024-05-15 09:00:00"),
          dayjs("2024-05-16 09:00:00"),
        ]}
        onChange={onChange}
        disabledTime={(_date: dayjs.Dayjs | null, type: "start" | "end") => ({
          disabledHours: () => (type === "end" ? [22] : []),
        })}
      />,
    );

    const startInput = screen.getAllByRole("textbox")[0];
    expect(startInput).toBeTruthy();
    if (!startInput) {
      throw new Error("Expected range start input");
    }

    fireEvent.change(startInput, {
      target: { value: "2024-05-17 22:30:00" },
    });
    fireEvent.keyUp(startInput, { key: "Enter" });

    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("DateRangePicker showTime", () => {
  test("renders a time column and keeps the panel open while picking", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <RangePicker
        showTime
        format="YYYY-MM-DD HH:mm"
        defaultValue={[dayjs("2026-05-05 09:30"), dayjs("2026-05-20 14:00")]}
        onChange={onChange}
      />,
    );

    const startInput = screen.getAllByRole("textbox")[0];
    if (!startInput) throw new Error("Expected range start input");
    await user.click(startInput);

    // Time column + shared footer are shown (regression: showTime had no UI).
    expect(
      document.querySelector('[data-slot="range-picker-time"]'),
    ).toBeTruthy();
    expect(
      document.querySelector('[data-slot="range-picker-footer"]'),
    ).toBeTruthy();

    const day = document.querySelector<HTMLButtonElement>(
      '[data-day="5/12/2026"]',
    );
    if (!day) throw new Error("Expected day button for 5/12/2026");
    await user.click(day);

    // Panel stays open for time editing (regression: closed immediately).
    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="range-picker-footer"]'),
      ).toBeTruthy();
    });
  });
});
