import "@testing-library/jest-dom/vitest";

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { z } from "zod";

import { Field } from "@acme/ui/components/field";

import { notification } from "../notification";
import { Form } from "./form";
import { useForm } from "./hooks/use-form";

// Regression: FormErrorsNotification once read the ROOT formState proxy, which
// latched control._proxyFormState.errors = 'all' and re-rendered the whole form
// (the useForm() owner) on every errors emission. It must use a scoped
// useFormState subscription instead, so the owner renders zero extra times.

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const schema = z.object({
  name: z.string().min(1, { message: "Required" }),
});

describe("form render escalation", () => {
  test("does not latch the root formState proxy to 'all', and the useForm owner does not re-render on error emissions", async () => {
    let ownerRenders = 0;
    let control: any;

    function Owner() {
      const form = useForm({
        schema,
        defaultValues: { name: "" },
        onSubmit: () => {},
      });
      control = form.control;
      ownerRenders += 1;
      return (
        <Form form={form} name="escalation">
          <Field name="name" control={form.control} label="Name">
            <input />
          </Field>
          <button type="submit">go</button>
        </Form>
      );
    }

    render(<Owner />);

    const before = ownerRenders;

    // Submit empty → async zod validation → two errors-bearing emissions.
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "go" }));
    });

    // The scoped field subscription surfaced the error...
    expect(await screen.findByText("Required")).toBeInTheDocument();

    // ...but the proxy is scoped (true), never escalated to 'all'.
    expect(control._proxyFormState.errors).not.toBe("all");
    expect(control._proxyFormState.errors).toBe(true);

    // ...and the useForm owner did not re-render for the errors emissions.
    expect(ownerRenders - before).toBe(0);
  });
});

// The component's actual purpose: alert on errors for REQUIRED schema fields
// that were never mounted (so no field could surface the error inline). Easy to
// break while refactoring the subscription — keep it covered.
describe("form errors notification purpose", () => {
  const purposeSchema = z.object({
    shown: z.string().min(1, { message: "Shown required" }),
    hidden: z.string().min(1, { message: "Hidden required" }),
  });

  function PurposeHarness() {
    const form = useForm({
      schema: purposeSchema,
      defaultValues: { shown: "", hidden: "" },
      onSubmit: () => {},
    });
    return (
      <Form form={form} name="purpose">
        {/* Only `shown` is mounted; `hidden` is a required field with no field. */}
        <Field name="shown" control={form.control} label="Shown">
          <input />
        </Field>
        <button type="submit">go</button>
      </Form>
    );
  }

  test("notifies for a required field that has no mounted control", async () => {
    const errorSpy = vi
      .spyOn(notification, "error")
      .mockImplementation(() => "" as unknown as string | number);

    render(<PurposeHarness />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "go" }));
    });

    await waitFor(() => expect(errorSpy).toHaveBeenCalledTimes(1));

    const arg = errorSpy.mock.calls[0]?.[0] as {
      message: string;
      description: string[];
    };
    expect(arg.message).toBe("Unexpected Form Errors");
    expect(arg.description).toContain("hidden: Hidden required");
    // The mounted field's error is surfaced inline, not in the notification.
    expect(arg.description.some((d) => d.startsWith("shown"))).toBe(false);
  });
});
