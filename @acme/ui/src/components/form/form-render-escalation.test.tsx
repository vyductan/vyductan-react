import "@testing-library/jest-dom/vitest";

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

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

// Static guard for the regression vector the fix exists to close: ANY read of
// the root `formState` proxy latches _proxyFormState[key] = 'all' for the
// lifetime of that control, re-rendering every form on each emission of that
// key. Scoped reads (useFormState) and the raw non-proxy store (_formState) are
// fine. This catches a future read the runtime tests above would miss, because
// they only exercise the components they happen to mount.
describe("no root formState proxy reads", () => {
  const ESCALATING_KEYS = [
    "errors",
    "isValid",
    "isDirty",
    "isValidating",
    "isLoading",
    "isSubmitting",
    "isSubmitted",
    "isSubmitSuccessful",
    "submitCount",
    "touchedFields",
    "dirtyFields",
    "validatingFields",
    "defaultValues",
    "disabled",
  ];

  const collect = (dir: string): string[] => {
    const out: string[] = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        out.push(...collect(full));
      } else if (
        /\.tsx?$/.test(entry.name) &&
        !/\.test\.tsx?$/.test(entry.name) &&
        !/\.stories\.tsx?$/.test(entry.name)
      ) {
        out.push(full);
      }
    }
    return out;
  };

  test("form and field source never read the root formState proxy", () => {
    const roots = [
      path.resolve(import.meta.dirname, "."),
      path.resolve(import.meta.dirname, "../field"),
    ];
    const offenders: string[] = [];

    for (const root of roots) {
      for (const file of collect(root)) {
        const source = readFileSync(file, "utf8");
        source.split("\n").forEach((line, index) => {
          const trimmed = line.trim();
          // Prose mentions the bad pattern by name; only code counts.
          if (
            trimmed.startsWith("//") ||
            trimmed.startsWith("*") ||
            trimmed.startsWith("/*")
          ) {
            return;
          }
          for (const key of ESCALATING_KEYS) {
            // `_formState.x` (raw store) and `useFormState` are the safe forms.
            const pattern = new RegExp(`(?<!_)\\bformState\\.${key}\\b`);
            if (pattern.test(line)) {
              offenders.push(`${path.basename(file)}:${index + 1} → ${line.trim()}`);
            }
          }
        });
      }
    }

    expect(offenders).toStrictEqual([]);
  });
});
