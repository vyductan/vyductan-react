import "@testing-library/jest-dom/vitest";

import type React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { z } from "zod";

import { Field } from "@acme/ui/components/field";

import { Form } from "./form";
import { useForm } from "./hooks/use-form";
import { FormItem } from "./_components";

// Characterization tests for the field VALUE-WIRING semantics shared by
// Form.Item and Field. They pin the observable contract of the binding:
//   - child's own onChange/onBlur run before the form commit
//   - `undefined` events commit as `null` (react-hook-form can't hold undefined)
//   - `normalize` runs on every commit; a normalize returning undefined → null
//   - `valuePropName` renames the injected value prop
//   - `getValueProps` output is spread onto the child
// Any refactor of the wiring must keep every test here green.

const schema = z.object({
  amount: z.any(),
});

/**
 * Probe child: renders its received props so tests can observe exactly what
 * the wiring injected, and exposes buttons that emit arbitrary payloads
 * through the injected onChange/onBlur.
 */
function Probe(props: {
  value?: unknown;
  checked?: unknown;
  displayText?: unknown;
  onChange?: (event: unknown) => void;
  onBlur?: (event: unknown) => void;
  [key: string]: unknown;
}) {
  return (
    <div>
      <div data-testid="value">{JSON.stringify(props.value ?? null)}</div>
      <div data-testid="checked">{JSON.stringify(props.checked ?? null)}</div>
      <div data-testid="display">{JSON.stringify(props.displayText ?? null)}</div>
      <button type="button" onClick={() => props.onChange?.("typed")}>
        emit-typed
      </button>
      <button type="button" onClick={() => props.onChange?.(undefined)}>
        emit-undefined
      </button>
      <button type="button" onClick={() => props.onBlur?.("blur-event")}>
        emit-blur
      </button>
    </div>
  );
}

function Harness({
  entry,
  fieldProps,
  childProps,
}: {
  entry: "form-item" | "field";
  fieldProps?: Record<string, unknown>;
  childProps?: Record<string, unknown>;
}) {
  const form = useForm({
    schema,
    defaultValues: { amount: "initial" },
    onSubmit: () => {},
  });

  const child = <Probe {...childProps} />;

  return (
    <Form form={form} name={`wiring-${entry}`}>
      {entry === "form-item" ? (
        <FormItem name="amount" control={form.control} {...fieldProps}>
          {child}
        </FormItem>
      ) : (
        <Field name="amount" control={form.control} {...fieldProps}>
          {child}
        </Field>
      )}
    </Form>
  );
}

afterEach(cleanup);

for (const entry of ["form-item", "field"] as const) {
  describe(`${entry} value wiring`, () => {
    test("injects the committed value into the child's value prop", () => {
      render(<Harness entry={entry} />);
      expect(screen.getByTestId("value")).toHaveTextContent('"initial"');
    });

    test("commits emitted events and re-renders the child with them", () => {
      render(<Harness entry={entry} />);
      fireEvent.click(screen.getByRole("button", { name: "emit-typed" }));
      expect(screen.getByTestId("value")).toHaveTextContent('"typed"');
    });

    test("commits undefined events as null", () => {
      render(<Harness entry={entry} />);
      fireEvent.click(screen.getByRole("button", { name: "emit-undefined" }));
      expect(screen.getByTestId("value")).toHaveTextContent("null");
    });

    test("runs normalize on commit with (value, previousValue)", () => {
      const normalize = vi.fn((value: unknown) => `normalized:${value}`);
      render(<Harness entry={entry} fieldProps={{ normalize }} />);
      fireEvent.click(screen.getByRole("button", { name: "emit-typed" }));
      expect(normalize).toHaveBeenCalledWith("typed", "initial");
      expect(screen.getByTestId("value")).toHaveTextContent(
        '"normalized:typed"',
      );
    });

    test("normalize returning undefined commits null", () => {
      render(
        <Harness entry={entry} fieldProps={{ normalize: () => undefined }} />,
      );
      fireEvent.click(screen.getByRole("button", { name: "emit-typed" }));
      expect(screen.getByTestId("value")).toHaveTextContent("null");
    });

    test("valuePropName renames the injected value prop", () => {
      render(<Harness entry={entry} fieldProps={{ valuePropName: "checked" }} />);
      expect(screen.getByTestId("checked")).toHaveTextContent('"initial"');
    });

    test("getValueProps output is spread onto the child", () => {
      render(
        <Harness
          entry={entry}
          fieldProps={{
            getValueProps: (value: unknown) => ({
              displayText: `shown:${value}`,
            }),
          }}
        />,
      );
      expect(screen.getByTestId("display")).toHaveTextContent(
        '"shown:initial"',
      );
    });

    test("child's own onChange runs before the commit; onBlur is chained", () => {
      const childChange = vi.fn();
      const childBlur = vi.fn();
      render(
        <Harness
          entry={entry}
          childProps={{ onChange: childChange, onBlur: childBlur }}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "emit-typed" }));
      expect(childChange).toHaveBeenCalledWith("typed");
      expect(screen.getByTestId("value")).toHaveTextContent('"typed"');

      fireEvent.click(screen.getByRole("button", { name: "emit-blur" }));
      expect(childBlur).toHaveBeenCalledWith("blur-event");
    });
  });
}
