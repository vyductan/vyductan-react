import { describe, expect, test, vi } from "vitest";

import { buildFieldChildProps, getFormValue } from "./field-binding";

describe("getFormValue", () => {
  test("passes values through without normalize", () => {
    expect(getFormValue("a", "prev")).toBe("a");
    expect(getFormValue(0, "prev")).toBe(0);
    expect(getFormValue(null, "prev")).toBeNull();
  });

  test("commits undefined as null", () => {
    expect(getFormValue(undefined, "prev")).toBeNull();
  });

  test("normalize receives (nextValue, previousValue)", () => {
    const normalize = vi.fn((v: unknown) => v);
    getFormValue(undefined, "prev", normalize);
    expect(normalize).toHaveBeenCalledWith(null, "prev");
  });

  test("normalize result replaces the value; undefined result becomes null", () => {
    expect(getFormValue("a", "prev", (v) => `n:${v}`)).toBe("n:a");
    expect(getFormValue("a", "prev", () => undefined)).toBeNull();
  });
});

describe("buildFieldChildProps", () => {
  const makeField = () => ({
    value: "current",
    onChange: vi.fn(),
    onBlur: vi.fn(),
    ref: () => {},
  });

  test("injects value, id, name and aria-invalid", () => {
    const props = buildFieldChildProps({
      field: makeField(),
      id: "f-x",
      name: "x",
      invalid: true,
    });

    expect(props.value).toBe("current");
    expect(props.id).toBe("f-x");
    expect(props.name).toBe("x");
    expect(props["aria-invalid"]).toBe(true);
  });

  test("omits id/name keys when not provided", () => {
    const props = buildFieldChildProps({ field: makeField(), invalid: false });
    expect("id" in props).toBe(false);
    // `name` still arrives via the spread react-hook-form field, not the binding
    expect(props.name).toBeUndefined();
  });

  test("valuePropName renames the value prop", () => {
    const props = buildFieldChildProps({
      field: makeField(),
      invalid: false,
      valuePropName: "checked",
    });
    expect(props.checked).toBe("current");
  });

  test("getValueProps output is spread last over the value", () => {
    const props = buildFieldChildProps({
      field: makeField(),
      invalid: false,
      getValueProps: (value) => ({ displayText: `d:${value}` }),
    });
    expect(props.displayText).toBe("d:current");
  });

  test("onChange chains child handler first, then commits through getFormValue", () => {
    const field = makeField();
    const childOnChange = vi.fn();
    const props = buildFieldChildProps({
      field,
      invalid: false,
      normalize: (v) => `n:${v}`,
      childProps: { onChange: childOnChange },
    });

    props.onChange("typed");

    expect(childOnChange).toHaveBeenCalledWith("typed");
    expect(field.onChange).toHaveBeenCalledWith("n:typed");
  });

  test("onBlur chains child handler then field.onBlur", () => {
    const field = makeField();
    const childOnBlur = vi.fn();
    const props = buildFieldChildProps({
      field,
      invalid: false,
      childProps: { onBlur: childOnBlur },
    });

    props.onBlur("blur-event");

    expect(childOnBlur).toHaveBeenCalledWith("blur-event");
    expect(field.onBlur).toHaveBeenCalled();
  });
});
