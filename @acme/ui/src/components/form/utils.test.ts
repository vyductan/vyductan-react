import { describe, expect, test } from "vitest";

import { requiredNumberSchema } from "./utils";

describe("requiredNumberSchema", () => {
  test("accepts numbers and numeric strings", () => {
    const schema = requiredNumberSchema("Amount is required");

    expect(schema.parse(12)).toBe(12);
    expect(schema.parse("12")).toBe(12);
  });

  test("treats empty values as missing", () => {
    const schema = requiredNumberSchema("Amount is required");

    expect(schema.safeParse("").error?.issues[0]?.message).toBe(
      "Amount is required",
    );
    expect(schema.safeParse(null).error?.issues[0]?.message).toBe(
      "Amount is required",
    );
    expect(
      schema.safeParse(undefined as unknown).error?.issues[0]?.message,
    ).toBe("Amount is required");
  });

  test("applies minimum value validation", () => {
    const schema = requiredNumberSchema("Amount is required", { min: 1 });

    expect(schema.safeParse(0).error?.issues[0]?.message).toBe(
      "Amount is required",
    );
    expect(schema.parse(1)).toBe(1);
  });
});
