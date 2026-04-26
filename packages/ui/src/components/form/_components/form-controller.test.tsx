import "@testing-library/jest-dom/vitest";

import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { z } from "zod";

import { Field, FieldLabel } from "@acme/ui/components/field";
import { Form, FormController, useForm } from "@acme/ui/components/form";
import { Input } from "@acme/ui/components/input";

const schema = z.object({
  card_name: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

function FormControllerTestCase() {
  const form = useForm<FormValues>({
    schema,
    defaultValues: {
      card_name: "",
    },
  });

  return (
    <Form name="form-controller-test" form={form}>
      <FormController
        control={form.control}
        name="card_name"
        render={({ field }) => (
          <Field>
            <FieldLabel htmlFor="card-name">Name on Card</FieldLabel>
            <Input {...field} id="card-name" />
          </Field>
        )}
      />
    </Form>
  );
}

describe("FormController", () => {
  test("provides field name context for schema-required labels", () => {
    render(<FormControllerTestCase />);

    expect(screen.getByText("Name on Card").closest("label")).toHaveTextContent(
      "Name on Card*",
    );
  });
});
