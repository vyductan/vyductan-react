import type { Dayjs } from "dayjs";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { z } from "zod";

import { Button } from "../button";
import { Field } from "../field";
import { Form } from "../form/form";
import { useForm } from "../form/hooks/use-form";
import { Input } from "../input/input";
import { DateRangePicker } from "./date-range-picker";

// Runs in the `browser` project: `userEvent` is Playwright-backed, so Enter
// goes through the browser's own implicit form submission — the native submit
// fires as the keydown's default action, before any keyup. jsdom and the
// synthetic `fireEvent.keyDown` in date-picker.test.tsx cannot see that race.
//
// AntD parity (@rc-component/picker RangePicker): Enter on keydown commits the
// typed text and does not preventDefault, so the form submits WITH the range.

const schema = z.object({
  range: z.any(),
  note: z.string().optional(),
});

function Harness({ onSubmit }: { onSubmit: (values: unknown) => void }) {
  const form = useForm({
    schema,
    defaultValues: { range: null, note: "" },
    onSubmit,
  });
  const touched = Boolean(form.formState.touchedFields.range);

  return (
    <Form form={form} name="date-range-picker-form">
      <Field name="range" control={form.control} label="Range">
        <DateRangePicker
          format="DD/MM/YYYY"
          placeholder={["Start date", "End date"]}
        />
      </Field>
      <Field name="note" control={form.control} label="Note">
        <Input placeholder="Note" />
      </Field>
      <span data-testid="range-touched">{String(touched)}</span>
      <Button htmlType="submit">Save</Button>
    </Form>
  );
}

const rangeOf = (call: unknown[] | undefined) =>
  (call?.[0] as { range?: [Dayjs | null, Dayjs | null] | null } | undefined)
    ?.range;

afterEach(() => document.body.replaceChildren());

describe("DateRangePicker inside a form, real keys", () => {
  test("type both ends + Enter submits the form with the typed range", async () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);

    await userEvent.click(screen.getByPlaceholderText("Start date"));
    await userEvent.keyboard("01/10/2026");
    await userEvent.keyboard("{Tab}");
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByPlaceholderText("End date"),
      ),
    );
    await userEvent.keyboard("29/10/2026");
    await userEvent.keyboard("{Enter}");

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const range = rangeOf(onSubmit.mock.calls.at(-1));
    expect(range?.[0]?.format("YYYY-MM-DD")).toBe("2026-10-01");
    expect(range?.[1]?.format("YYYY-MM-DD")).toBe("2026-10-29");
  });

  test("Tab out of the picker commits and marks the Field touched", async () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);

    await userEvent.click(screen.getByPlaceholderText("Start date"));
    await userEvent.keyboard("01/10/2026{Tab}29/10/2026{Tab}");

    // Field injects onBlur; it must reach the picker once focus leaves it.
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByPlaceholderText("Note")),
    );
    await waitFor(() =>
      expect(screen.getByTestId("range-touched").textContent).toBe("true"),
    );

    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const range = rangeOf(onSubmit.mock.calls[0]);
    expect(range?.[0]?.format("YYYY-MM-DD")).toBe("2026-10-01");
    expect(range?.[1]?.format("YYYY-MM-DD")).toBe("2026-10-29");
  });
});
