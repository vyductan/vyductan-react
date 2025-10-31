import * as React from "react";

import { cn } from "@acme/ui/lib/utils";
import { Checkbox as ShadcnCheckbox } from "@acme/ui/shadcn/checkbox";

import type { FormValueType } from "../form";
import type { CheckboxGroupContext } from "./group-context";
import { devUseWarning } from "../_util/warning";
import Wave from "../../lib/wave";
import { LoadingIcon } from "../button";
import { ConfigContext } from "../config-provider/context";
import DisabledContext from "../config-provider/disabled-context";
import { inputDisabledVariants } from "../input";
import GroupContext from "./group-context";
import useBubbleLock from "./use-bubble-lock";

type AbstractCheckboxProps<
  TChangeEvent,
  TValue extends FormValueType = FormValueType,
> = {
  id?: string;
  name?: string;

  // value
  value?: TValue;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (e: TChangeEvent) => void;
  onClick?: React.MouseEventHandler<HTMLElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLElement>;

  // state
  disabled?: boolean;
  loading?: boolean;

  // styles
  style?: React.CSSProperties;
  className?: string;
  classNames?: {
    label?: string;
  };

  // render
  children?: React.ReactNode;

  // config
  skipGroup?: boolean;
};
export interface CheckboxChangeEventTarget<
  TValue extends FormValueType = FormValueType,
> extends Omit<CheckboxProps<TValue>, "value"> {
  checked: boolean;
  name?: string;
  type: "checkbox" | "radio";
  value: TValue;
}

export interface CheckboxChangeEvent<
  TValue extends FormValueType = FormValueType,
> {
  type: "change";
  target: CheckboxChangeEventTarget<TValue>;
  stopPropagation: () => void;
  preventDefault: () => void;
  nativeEvent: MouseEvent;
}

type CheckboxProps<TValue extends FormValueType = FormValueType> =
  AbstractCheckboxProps<CheckboxChangeEvent<TValue>, TValue> &
    React.AriaAttributes & {
      key?: React.Key; // fix warning when use key (shadcn)
      indeterminate?: boolean;
    };

const Checkbox = <TValue extends FormValueType = FormValueType>(
  props: CheckboxProps<TValue>,
) => {
  const {
    // id,
    // "aria-describedby": ariaDescribedBy,
    // "aria-invalid": ariaInvalid,

    value,

    loading,
    disabled,

    indeterminate = false,
    // checked,
    // defaultChecked,

    // styles
    style,
    className,
    classNames,
    // render
    children,

    skipGroup,

    // on
    // onClick,
    onChange,
    onMouseEnter,
    onMouseLeave,
    ...restProps
  } = props;

  const { direction, checkbox } = React.useContext(ConfigContext);
  const checkboxGroup = React.useContext(
    GroupContext as unknown as React.Context<CheckboxGroupContext<TValue> | null>,
  );
  const contextDisabled = React.useContext(DisabledContext);
  const mergedDisabled = checkboxGroup?.disabled ?? disabled ?? contextDisabled;

  if (process.env.NODE_ENV !== "production") {
    const warning = devUseWarning("Checkbox");

    warning(
      "checked" in restProps || !!checkboxGroup || !("value" in restProps),
      "usage",
      "`value` is not a valid prop, do you mean `checked`?",
    );
  }

  const checkboxProps: CheckboxProps<TValue> = { ...restProps };
  if (checkboxGroup && !skipGroup) {
    checkboxProps.onChange = (...args) => {
      if (onChange) {
        onChange(...args);
      }
      if (checkboxGroup.toggleOption && value !== undefined) {
        checkboxGroup.toggleOption({ label: children, value });
      }
    };
    checkboxProps.name = checkboxGroup.name;
    checkboxProps.checked =
      value === undefined
        ? false
        : Boolean(checkboxGroup.value?.includes(value));
  }

  // ============================ Event Lock ============================
  const [onLabelClick, onInputClick] = useBubbleLock(checkboxProps.onClick);

  return (
    <Wave component="Checkbox" disabled={mergedDisabled}>
      <label
        className={cn(
          "inline-flex shrink-0 cursor-pointer items-baseline text-sm",
          direction === "rtl" ? "flex-row-reverse" : "flex-row",
          inputDisabledVariants({ disabled: mergedDisabled }),
          className,
        )}
        style={{ ...checkbox?.style, ...style }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onLabelClick}
      >
        <ShadcnCheckbox
          className={cn(
            "data-[state=indeterminate]:bg-muted",
            "self-center",
            "disabled:border-black/55 disabled:bg-black/15",
          )}
          value={value as string | undefined}
          checked={indeterminate ? "indeterminate" : restProps.checked}
          disabled={mergedDisabled}
          onClick={onInputClick}
          onCheckedChange={(checked) => {
            onChange?.({
              type: "change",
              target: {
                type: "checkbox",
                name: props.name,
                value: value as unknown as TValue,
                checked: checked === "indeterminate" ? false : checked,
                indeterminate,
                // "aria-describedby": ariaDescribedBy,
                // "aria-invalid": ariaInvalid,
              },

              nativeEvent: new MouseEvent("change"),
              preventDefault: () => {
                //
              },
              stopPropagation: () => {
                //
              },
            });
          }}
          {...restProps}
        />
        {loading ? (
          <LoadingIcon />
        ) : (
          <span
            data-slot="checkbox-label"
            className={cn("leading-line-height px-2", classNames?.label)}
          >
            {children}
          </span>
        )}
      </label>
    </Wave>
  );
};

export type { CheckboxProps, AbstractCheckboxProps };
export { Checkbox };
