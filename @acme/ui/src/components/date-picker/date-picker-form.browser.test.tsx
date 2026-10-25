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
import { DatePicker } from "./date-picker";

// Runs in the `browser` project: `userEvent` is Playwright-backed, so Enter
// goes through the browser's own implicit form submission — the native submit
// fires as the keydown's default action, before any keyup. jsdom and the
// synthetic `fireEvent.keyUp` in date-picker.test.tsx cannot see that race.
//
// AntD parity (@rc-component/picker): Enter on keydown commits valid typed text
// and does not preventDefault, so the form submits WITH the new date; Tab on
// keydown commits too ("keyboard-submit-weak") and focus moves on.

const schema = z.object({
  due: z.any(),
  note: z.string().optional(),
});

function Harness({ onSubmit }: { onSubmit: (values: unknown) => void }) {
  const form = useForm({
    schema,
    defaultValues: { due: null, note: "" },
    onSubmit,
  });

  return (
    <Form form={form} name="date-picker-form">
      <Field name="due" control={form.control} label="Due">
        <DatePicker format="DD/MM/YYYY" placeholder="Due date" />
      </Field>
      <Field name="note" control={form.control} label="Note">
        <Input placeholder="Note" />
      </Field>
      <Button htmlType="submit">Save</Button>
    </Form>
  );
}

const dueOf = (call: unknown[] | undefined) =>
  (call?.[0] as { due?: Dayjs | null } | undefined)?.due;

afterEach(() => document.body.replaceChildren());

describe("DatePicker inside a form, real keys", () => {
  test("type + Enter submits the form with the typed date", async () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);

    await userEvent.click(screen.getByPlaceholderText("Due date"));
    await userEvent.keyboard("29/10/2026");
    await userEvent.keyboard("{Enter}");

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(dueOf(onSubmit.mock.calls[0])?.format("YYYY-MM-DD")).toBe(
      "2026-10-29",
    );
  });

  test("type + Tab commits the typed date", async () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);

    await userEvent.click(screen.getByPlaceholderText("Due date"));
    await userEvent.keyboard("29/10/2026");
    await userEvent.keyboard("{Tab}");

    // Like AntD, Tab leaves the picker for the next field (the panel is not a
    // tab stop) — then Enter there submits whatever the picker committed.
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByPlaceholderText("Note")),
    );
    await userEvent.keyboard("{Enter}");

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(dueOf(onSubmit.mock.calls[0])?.format("YYYY-MM-DD")).toBe(
      "2026-10-29",
    );
  });
});
