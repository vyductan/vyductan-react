import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { z } from "zod";

import { FieldLabel } from "./field-label";
import { Provider as FormProvider, FormFieldContext } from "../form/context";

afterEach(() => {
  cleanup();
});

describe("FieldLabel", () => {
  test("renders explicit required state without schema inference", () => {
    render(<FieldLabel required>Email</FieldLabel>);

    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  test("explicit required false suppresses schema-inferred required state", () => {
    const form = {
      schema: z.object({
        email: z.string().min(1, "Email is required"),
      }),
    };

    render(
      <FormProvider
        value={{
          id: "test-form",
          form: form as never,
          children: null,
        }}
      >
        <FormFieldContext.Provider value={{ name: "email" as never }}>
          <FieldLabel required={false}>Email</FieldLabel>
        </FormFieldContext.Provider>
      </FormProvider>,
    );

    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  test("infers required state from schema when a field name is provided by context", () => {
    const form = {
      schema: z.object({
        email: z.string().min(1, "Email is required"),
      }),
    };

    render(
      <FormProvider
        value={{
          id: "test-form",
          form: form as never,
          children: null,
        }}
      >
        <FormFieldContext.Provider value={{ name: "email" as never }}>
          <FieldLabel>Email</FieldLabel>
        </FormFieldContext.Provider>
      </FormProvider>,
    );

    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  test("does not infer required state for optional schema fields", () => {
    const form = {
      schema: z.object({
        nickname: z.string().optional(),
      }),
    };

    render(
      <FormProvider
        value={{
          id: "test-form",
          form: form as never,
          children: null,
        }}
      >
        <FormFieldContext.Provider value={{ name: "nickname" as never }}>
          <FieldLabel>Nickname</FieldLabel>
        </FormFieldContext.Provider>
      </FormProvider>,
    );

    expect(screen.getByText("Nickname")).toBeInTheDocument();
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });
});
