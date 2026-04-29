import "@testing-library/jest-dom/vitest";

import type React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { z } from "zod";

import { Input, InputNumber } from "@acme/ui/components/input";

import { Field, FormItem } from ".";
import { Form } from "../form";
import { useForm } from "../hooks/use-form";

const formSchema = z.object({
  card_name: z.string().min(1, { message: "Please input your card name!" }),
});

const paymentFormSchema = z.object({
  cvv: z.string().min(1, { message: "Please input your cvv!" }),
});

const limitFormSchema = z.object({
  softLimitPerPax: z.number().min(1, { message: "Please input your soft limit!" }),
  hardLimitPerPax: z.number().min(1, { message: "Please input your hard limit!" }),
});

function TestForm(): React.JSX.Element {
  const form = useForm({
    schema: formSchema,
    defaultValues: {
      card_name: "",
    },
    onSubmit: () => {},
  });

  return (
    <Form form={form} name="field-item-demo">
      <Field name="card_name" control={form.control} label="Name on Card">
        <Input placeholder="Evil Rabbit" autoComplete="off" />
      </Field>
      <button type="submit">Submit</button>
    </Form>
  );
}

function InputNumberTestForm(): React.JSX.Element {
  const form = useForm({
    schema: paymentFormSchema,
    defaultValues: {
      cvv: "",
    },
    mode: "onChange",
    onSubmit: () => {},
  });

  return (
    <Form form={form} name="input-number-field-item-demo">
      <Field
        name="cvv"
        control={form.control}
        label="CVV"
        normalize={(value) => (value === null ? "" : String(value))}
      >
        <InputNumber placeholder="123" controls={false} />
      </Field>
      <button type="submit">Submit</button>
    </Form>
  );
}

function PrefixedInputTestForm(): React.JSX.Element {
  const form = useForm({
    schema: paymentFormSchema,
    defaultValues: {
      cvv: "",
    },
    onSubmit: () => {},
  });

  return (
    <Form form={form} name="prefixed-input-field-item-demo">
      <Field name="cvv" control={form.control} label="CVV">
        <Input placeholder="0" prefix="¥" />
      </Field>
      <button type="submit">Submit</button>
    </Form>
  );
}

function LegacyFormItemTestForm(): React.JSX.Element {
  const form = useForm({
    schema: limitFormSchema,
    defaultValues: {
      softLimitPerPax: undefined,
      hardLimitPerPax: undefined,
    },
    mode: "onChange",
    onSubmit: () => {},
  });

  return (
    <Form form={form} name="legacy-form-item-demo">
      <FormItem
        name="softLimitPerPax"
        control={form.control}
        label="Soft Limit / Pax"
      >
        <InputNumber inputMode="decimal" placeholder="0" prefix="¥" />
      </FormItem>
      <FormItem
        name="hardLimitPerPax"
        control={form.control}
        label="Hard Limit / Pax"
      >
        <Input inputMode="decimal" placeholder="0" prefix="¥" />
      </FormItem>
      <button type="submit">Submit</button>
    </Form>
  );
}

afterEach(cleanup);

describe("Field", () => {
  test("binds form state to a child while rendering the composable field layout", async () => {
    render(<TestForm />);

    const input = screen.getByRole("textbox", { name: /name on card/i });
    const field = input.closest('[data-slot="field"]');

    const label = screen.getByText("Name on Card").closest("label");

    expect(input).toHaveAttribute("name", "card_name");
    expect(input).toHaveAttribute("aria-invalid", "false");
    expect(label).toHaveAttribute("for", input.getAttribute("id"));
    expect(label).toHaveTextContent("Name on Card*");
    expect(field).not.toHaveAttribute("data-invalid", "true");
    expect(field?.querySelector('[data-slot="field-error"]')).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(
      await screen.findByText("Please input your card name!"),
    ).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAttribute("data-invalid", "true");
  });

  test("applies invalid border to InputNumber without changing placeholder color", async () => {
    render(<InputNumberTestForm />);

    const input = screen.getByRole("spinbutton", { name: /cvv/i });
    const affixWrapper = input.closest('[data-slot="affix-wrapper"]');

    expect(input).toHaveAttribute("aria-invalid", "false");
    expect(input).toHaveClass("placeholder:text-placeholder");

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(await screen.findByText("Please input your cvv!")).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveClass("placeholder:text-placeholder");
    expect(input).toHaveClass("text-foreground");
    expect(input).not.toHaveClass("placeholder:text-error");
    expect(affixWrapper).toHaveClass("border-error");
    expect(affixWrapper).toHaveClass("focus-within:border-error");
  });

  test("keeps prefixed Input placeholder color in invalid state", async () => {
    render(<PrefixedInputTestForm />);

    const input = screen.getByRole("textbox", { name: /cvv/i });

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(await screen.findByText("Please input your cvv!")).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveClass("placeholder:text-placeholder");
    expect(input).toHaveClass("text-foreground");
    expect(input).not.toHaveClass("placeholder:text-error");
  });

  test("clears InputNumber field errors after entering a valid value", async () => {
    render(<InputNumberTestForm />);

    const input = screen.getByRole("spinbutton", { name: /cvv/i });
    const field = input.closest('[data-slot="field"]');

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(await screen.findByText("Please input your cvv!")).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-invalid", "true");

    fireEvent.change(input, { target: { value: "123" } });

    await waitFor(() => {
      expect(screen.queryByText("Please input your cvv!")).not.toBeInTheDocument();
    });
    expect(input).toHaveAttribute("aria-invalid", "false");
    expect(field).not.toHaveAttribute("data-invalid", "true");
  });

  test("clears legacy FormItem InputNumber errors after entering a valid number", async () => {
    render(<LegacyFormItemTestForm />);

    const input = screen.getByRole("spinbutton", {
      name: /soft limit \/ pax/i,
    });
    const formItem = input.closest('[data-slot="form-item"]');

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(await screen.findAllByRole("alert")).not.toHaveLength(0);
    expect(input).toHaveAttribute("aria-invalid", "true");

    fireEvent.change(input, { target: { value: "123" } });

    await waitFor(() => {
      expect(formItem?.querySelector('[role="alert"]')).toBeNull();
    });
    expect(input).toHaveAttribute("aria-invalid", "false");
    expect(formItem).not.toHaveAttribute("data-invalid", "true");
  });
});
