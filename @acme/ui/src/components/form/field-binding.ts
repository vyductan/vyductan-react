/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * The single implementation of the field value-wiring contract shared by
 * `Form.Item` and `Field`. Presenters differ in layout (FormItemRow vs
 * ShadField) but must bind their child identically:
 *
 *   - the committed value is injected as `value` (or `valuePropName`)
 *   - `getValueProps(value)` output is spread onto the child
 *   - the child's own onChange/onBlur run before the form commit
 *   - the value is extracted from the child's onChange arguments before
 *     `normalize`: a custom `getValueFromEvent(...args)` wins, otherwise the
 *     default extractor pulls `event.target[valuePropName]` for events (and
 *     passes non-event values through) — so `normalize` always sees a value,
 *     matching AntD
 *   - `undefined` events commit as `null` (react-hook-form cannot hold
 *     undefined), and a `normalize` returning undefined also commits `null`
 *
 * The contract is pinned by form/field-wiring.test.tsx through both public
 * entry points; change it there first.
 */

interface BindableField {
  value: any;
  onChange: (value: any) => void;
  onBlur: () => void;
  [key: string]: any;
}

interface BindableChildProps {
  onChange?: (...args: any[]) => void;
  onBlur?: (event: any) => void;
}

interface FieldBindingOptions {
  /** react-hook-form's ControllerRenderProps for this field */
  field: BindableField;
  /** id to place on the child input (label htmlFor pairs with it) */
  id?: string;
  name?: string;
  invalid: boolean;
  /** rename the injected value prop, e.g. "checked" for Switch */
  valuePropName?: string;
  /** extra props derived from the committed value, spread last */
  getValueProps?: (value: any) => Record<string, any>;
  /** extract the value from the child's onChange arguments before normalize */
  getValueFromEvent?: (...args: any[]) => any;
  /** transform (value, previousValue) before committing */
  normalize?: (value: any, previousValue: any) => any;
  /** the child element's own handlers, chained before the commit */
  childProps?: BindableChildProps;
}

/**
 * Default value extraction, mirroring AntD's rc-field-form: if the first
 * onChange argument is an event, pull `event.target[valuePropName]` (value /
 * checked); otherwise pass the argument through unchanged (custom controls that
 * already emit a value). Runs whenever no explicit `getValueFromEvent` is set,
 * so `normalize` receives a real value — not the raw event.
 */
export function defaultGetValueFromEvent(
  valuePropName: string,
  ...args: any[]
): any {
  const event = args[0];
  if (
    event &&
    typeof event === "object" &&
    "target" in event &&
    event.target &&
    typeof event.target === "object" &&
    valuePropName in event.target
  ) {
    return event.target[valuePropName];
  }
  return event;
}

/** Resolve the value to commit: undefined → null, then normalize (→ null). */
export function getFormValue(
  value: unknown,
  previousValue: unknown,
  normalize?: (value: any, previousValue: any) => any,
): unknown {
  const nextValue = value === undefined ? null : value;

  if (!normalize) {
    return nextValue;
  }

  const normalizedValue = normalize(nextValue, previousValue);

  return normalizedValue === undefined ? null : normalizedValue;
}

/** Build the props a presenter clones onto its child input element. */
export function buildFieldChildProps({
  field,
  id,
  name,
  invalid,
  valuePropName,
  getValueProps,
  getValueFromEvent,
  normalize,
  childProps,
}: FieldBindingOptions): Record<string, any> {
  return {
    ...field,
    ...(id === undefined ? {} : { id }),
    ...(name === undefined ? {} : { name }),
    "aria-invalid": invalid,
    [valuePropName ?? "value"]: field.value,
    ...(getValueProps ? getValueProps(field.value) : {}),
    onBlur: (event: any) => {
      childProps?.onBlur?.(event);
      field.onBlur();
    },
    onChange: (...args: any[]) => {
      childProps?.onChange?.(...args);
      // AntD order: extract the value from the onChange arguments first, then
      // normalize. A custom getValueFromEvent wins; otherwise the default
      // extractor pulls event.target[valuePropName] (so normalize sees a value,
      // not the raw event).
      const rawValue = getValueFromEvent
        ? getValueFromEvent(...args)
        : defaultGetValueFromEvent(valuePropName ?? "value", ...args);
      field.onChange(getFormValue(rawValue, field.value, normalize));
    },
  };
}
