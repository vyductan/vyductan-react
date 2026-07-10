/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * The single implementation of the field value-wiring contract shared by
 * `Form.Item` and `Field`. Presenters differ in layout (FormItemRow vs
 * ShadField) but must bind their child identically:
 *
 *   - the committed value is injected as `value` (or `valuePropName`)
 *   - `getValueProps(value)` output is spread onto the child
 *   - the child's own onChange/onBlur run before the form commit
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
  onChange?: (event: any) => void;
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
  /** transform (value, previousValue) before committing */
  normalize?: (value: any, previousValue: any) => any;
  /** the child element's own handlers, chained before the commit */
  childProps?: BindableChildProps;
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
    onChange: (event: any) => {
      childProps?.onChange?.(event);
      field.onChange(getFormValue(event, field.value, normalize));
    },
  };
}
