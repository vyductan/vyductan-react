import React from "react";
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import dayjs from "dayjs";
import { afterEach, describe, expect, test, vi } from "vitest";

import { DatePicker } from "./date-picker";

globalThis.React = React;

globalThis.ResizeObserver ??= class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

afterEach(() => {
  cleanup();
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

    render(
      <DatePicker
        picker="week"
        defaultValue={dayjs("2024-05-15")}
      />,
    );

    const input = screen.getByRole("textbox");

    await user.click(input);

    const selectedDay = document.querySelector<HTMLButtonElement>(
      '[data-day="5/16/2024"]',
    );

    expect(selectedDay).toBeTruthy();
    if (!selectedDay) {
      throw new Error('Expected day button for 5/16/2024');
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
      throw new Error('Expected current day button for 5/16/2024');
    }
    await user.click(currentSelectedDay);
    await user.click(document.body);

    await waitFor(() => {
      expect(input).toHaveValue("2024-05-12");
    });
  });

  test("commits the start of the selected quarter", async () => {
    const user = userEvent.setup();

    render(
      <DatePicker
        picker="quarter"
        defaultValue={dayjs("2024-08-15")}
      />,
    );

    const input = screen.getByRole("textbox");

    await user.click(input);
    await user.click(await screen.findByRole("button", { name: "Aug" }));

    const mayOption = [...document.querySelectorAll<HTMLElement>("[role='button']")].find(
      (element) => element.textContent?.trim() === "May",
    );
    expect(mayOption).toBeTruthy();
    if (!mayOption) {
      throw new Error('Expected month option "May"');
    }

    await user.hover(mayOption);

    const currentMayOption = [...document.querySelectorAll<HTMLElement>("[role='button']")].find(
      (element) => element.textContent?.trim() === "May",
    );
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
});
