import React from "react";

import "@testing-library/jest-dom/vitest";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { describe, expect, test, vi } from "vitest";

import { Field } from "../field";
import { RadioGroup, RadioGroupItem } from "./index";

globalThis.React = React;

globalThis.ResizeObserver ??= class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

function Harness({ onSubmit }: { onSubmit: (values: { plan: string }) => void }) {
  const form = useForm<{ plan: string }>({ defaultValues: { plan: "" } });
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Field control={form.control} name="plan" label="Plan">
        <RadioGroup>
          <label>
            <RadioGroupItem value="free" />
            Free
          </label>
          <label>
            <RadioGroupItem value="pro" />
            Pro
          </label>
        </RadioGroup>
      </Field>
      <button type="submit">Submit</button>
    </form>
  );
}

describe("RadioGroup inside Field (RHF)", () => {
  test("manual children: selecting an item updates the form value", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<Harness onSubmit={onSubmit} />);

    await user.click(screen.getByRole("radio", { name: /pro/i }));
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({ plan: "pro" });
  });
});
