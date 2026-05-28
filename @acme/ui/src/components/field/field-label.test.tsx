import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { z } from "zod";

import { FormFieldContext, Provider as FormProvider } from "../form/context";
import { FieldLabel } from "./field-label";

afterEach(() => {
  cleanup();
});

const renderFieldLabelWithSchema = ({
  schema,
  name,
  ...properties
}: {
  schema: z.ZodType;
  name: string;
} & React.ComponentProps<typeof FieldLabel>) => {
  const form = { schema };

  render(
    <FormProvider
      value={{
        id: "test-form",
        form: form as never,
        children: null,
      }}
    >
      <FormFieldContext.Provider value={{ name: name as never }}>
        <FieldLabel {...properties} />
      </FormFieldContext.Provider>
    </FormProvider>,
  );
};

describe("FieldLabel", () => {
  test("renders explicit required state without schema inference", () => {
    render(<FieldLabel required>Email</FieldLabel>);

    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  test("explicit required false suppresses schema-inferred required state", () => {
    renderFieldLabelWithSchema({
      schema: z.object({
        email: z.string().min(1, "Email is required"),
      }),
      name: "email",
      required: false,
      children: "Email",
    });

    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  test("infers required state from schema when a field name is provided by context", () => {
    renderFieldLabelWithSchema({
      schema: z.object({
        email: z.string().min(1, "Email is required"),
      }),
      name: "email",
      children: "Email",
    });

    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  test("does not infer required state for nullable schema fields", () => {
    renderFieldLabelWithSchema({
      schema: z.object({
        duration: z.number().nonnegative().nullable(),
      }),
      name: "duration",
      children: "Duration",
    });

    expect(screen.getByText("Duration")).toBeInTheDocument();
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  test("does not infer required state for defaulted schema fields", () => {
    renderFieldLabelWithSchema({
      schema: z.object({
        scheduled_for: z
          .enum(["agent_booking", "ota", "allotment"])
          .default("agent_booking"),
      }),
      name: "scheduled_for",
      children: "Scheduled For",
    });

    expect(screen.getByText("Scheduled For")).toBeInTheDocument();
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  test("does not infer required state for arrays that allow empty values", () => {
    renderFieldLabelWithSchema({
      schema: z.object({
        scheduled_times: z.array(
          z.object({
            start_time: z.string().trim().min(1, "Start time is required"),
            scheduled_for: z
              .enum(["agent_booking", "ota", "allotment"])
              .default("agent_booking"),
          }),
        ),
      }),
      name: "scheduled_times",
      children: "Scheduled Times",
    });

    expect(screen.getByText("Scheduled Times")).toBeInTheDocument();
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  test("does not infer required state for arrays with a minimum length of zero", () => {
    renderFieldLabelWithSchema({
      schema: z.object({
        scheduled_times: z
          .array(
            z.object({
              start_time: z.string().trim().min(1, "Start time is required"),
              scheduled_for: z
                .enum(["agent_booking", "ota", "allotment"])
                .default("agent_booking"),
            }),
          )
          .min(0),
      }),
      name: "scheduled_times",
      children: "Scheduled Times",
    });

    expect(screen.getByText("Scheduled Times")).toBeInTheDocument();
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  test("infers required state for arrays with a minimum length of one", () => {
    renderFieldLabelWithSchema({
      schema: z.object({
        scheduled_times: z
          .array(
            z.object({
              start_time: z.string().trim().min(1, "Start time is required"),
              scheduled_for: z
                .enum(["agent_booking", "ota", "allotment"])
                .default("agent_booking"),
            }),
          )
          .min(1, "At least one schedule is required"),
      }),
      name: "scheduled_times",
      children: "Scheduled Times",
    });

    expect(screen.getByText("Scheduled Times")).toBeInTheDocument();
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  test("does not infer required state for optional schema fields", () => {
    renderFieldLabelWithSchema({
      schema: z.object({
        nickname: z.string().optional(),
      }),
      name: "nickname",
      children: "Nickname",
    });

    expect(screen.getByText("Nickname")).toBeInTheDocument();
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  test("keeps label text selectable for copying", () => {
    render(<FieldLabel htmlFor="email">Email address</FieldLabel>);

    expect(screen.getByText("Email address").closest("label")).toHaveClass(
      "select-text",
    );
  });
});
