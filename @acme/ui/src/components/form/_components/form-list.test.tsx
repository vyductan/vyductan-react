import "@testing-library/jest-dom/vitest";

import type React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { z } from "zod";

import { Input } from "@acme/ui/components/input";

import { Form } from "../form";
import { FormItem } from ".";
import { useForm } from "../hooks/use-form";
import { FieldList } from "./form-list";

// Characterization tests for Form.List's public contract: it renders a label
// wrapper and hands children a (fields, ctx) pair whose add/remove helpers
// mutate the field array. The wrapper markup may change; this behaviour must not.

const schema = z.object({
  users: z.array(z.object({ name: z.string() })),
});

function ListHarness(): React.JSX.Element {
  const form = useForm({
    schema,
    defaultValues: { users: [{ name: "An" }, { name: "Bo" }] },
    onSubmit: () => {},
  });

  return (
    <Form form={form} name="list-demo">
      <FieldList control={form.control} name="users" label="Users">
        {(fields, { add, remove }) => (
          <div>
            {fields.map((field) => (
              <div key={field.key} data-testid="row">
                <FormItem
                  name={`${field.name}.name` as never}
                  control={form.control}
                  label={`Row ${field.name}`}
                >
                  <Input />
                </FormItem>
                <button type="button" onClick={() => remove(field.name)}>
                  remove {field.name}
                </button>
              </div>
            ))}
            <button type="button" onClick={() => add({ name: "New" })}>
              add
            </button>
          </div>
        )}
      </FieldList>
    </Form>
  );
}

afterEach(cleanup);

describe("Form.List (FieldList)", () => {
  test("renders the list label and one entry per default value", () => {
    render(<ListHarness />);

    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getAllByTestId("row")).toHaveLength(2);
    expect(screen.getByRole("textbox", { name: /row users\.0/i })).toHaveValue(
      "An",
    );
    expect(screen.getByRole("textbox", { name: /row users\.1/i })).toHaveValue(
      "Bo",
    );
  });

  test("add appends a row with the given default value", () => {
    render(<ListHarness />);

    fireEvent.click(screen.getByRole("button", { name: "add" }));

    expect(screen.getAllByTestId("row")).toHaveLength(3);
    expect(screen.getByRole("textbox", { name: /row users\.2/i })).toHaveValue(
      "New",
    );
  });

  test("remove deletes the row addressed by field name", () => {
    render(<ListHarness />);

    fireEvent.click(screen.getByRole("button", { name: "remove users.0" }));

    expect(screen.getAllByTestId("row")).toHaveLength(1);
    expect(screen.getByRole("textbox", { name: /row users\.0/i })).toHaveValue(
      "Bo",
    );
  });
});
