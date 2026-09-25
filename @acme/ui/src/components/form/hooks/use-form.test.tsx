import "@testing-library/jest-dom/vitest";

import type React from "react";
import { useEffect } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { Input } from "@acme/ui/components/input";

import { FormItem } from "../_components";
import { Form } from "../form";
import { useForm } from "./use-form";

// The FormInstance is intentionally a stable object (cached in a ref) whose
// members are refreshed every render. These tests pin the freshness contract:
// members that close over props must see the LATEST props, not the ones from
// the first render.

function Harness({
  defaults,
}: {
  defaults: { name: string };
}): React.JSX.Element {
  const form = useForm({
    defaultValues: defaults,
    onSubmit: () => {},
  });

  return (
    <Form form={form} name="freshness-demo">
      <FormItem name="name" control={form.control} label="Name">
        <Input />
      </FormItem>
      <button type="button" onClick={() => form.resetFields()}>
        reset-fields
      </button>
    </Form>
  );
}

afterEach(cleanup);

describe("useForm instance freshness", () => {
  test("resetFields resets to the latest defaultValues prop, not the first-render one", () => {
    const { rerender } = render(<Harness defaults={{ name: "first" }} />);

    const input = screen.getByRole("textbox", { name: /name/i });
    expect(input).toHaveValue("first");

    // User edits, then the parent supplies new defaults.
    fireEvent.change(input, { target: { value: "edited" } });
    rerender(<Harness defaults={{ name: "second" }} />);

    fireEvent.click(screen.getByRole("button", { name: "reset-fields" }));

    // A stale resetFields closure would reset to "first".
    expect(input).toHaveValue("second");
  });

  test("resetFields keeps a stable identity across renders with inline defaultValues", () => {
    // Mirrors the common "reset when the modal opens" pattern: an effect that
    // depends on resetFields. If its identity changes every render, the reset
    // re-renders, the effect re-runs, and React logs "Maximum update depth".
    // The effect is capped so a regression fails the assertion instead of
    // hanging the test run.
    let effectRuns = 0;
    function ResetOnRender(): React.JSX.Element {
      const form = useForm({ defaultValues: { name: "" } });
      const { resetFields } = form;
      useEffect(() => {
        effectRuns += 1;
        if (effectRuns <= 20) resetFields();
      }, [resetFields]);
      return (
        <Form form={form} name="stable-reset-demo">
          <FormItem name="name" control={form.control} label="Name">
            <Input />
          </FormItem>
        </Form>
      );
    }

    const { rerender } = render(<ResetOnRender />);
    const input = screen.getByRole("textbox", { name: /name/i });
    fireEvent.change(input, { target: { value: "Best Regards" } });
    rerender(<ResetOnRender />);
    expect(effectRuns).toBe(1);
  });
});
