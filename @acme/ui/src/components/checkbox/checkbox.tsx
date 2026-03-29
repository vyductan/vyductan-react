import * as React from "react";

import { cn } from "@acme/ui/lib/utils";
import { Checkbox as ShadcnCheckbox } from "@acme/ui/shadcn/checkbox";

import Wave from "../../lib/wave";
import { devUseWarning } from "../_util/warning";
import { LoadingIcon } from "../button";
import { ConfigContext } from "../config-provider/context";
import DisabledContext from "../config-provider/disabled-context";
import type { FormValueType } from "../form";
import { inputDisabledVariants } from "../input";
import type { CheckboxGroupContext } from "./group-context";
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
  variant?: "default" | "card";

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

function Checkbox<TValue extends FormValueType = FormValueType>(
  props: CheckboxProps<TValue>,
) {
  const {
    // id,
    // "aria-describedby": ariaDescribedBy,
    // "aria-invalid": ariaInvalid,

    value,

    loading,
    disabled,

    indeterminate = false,
    checked,
    defaultChecked,

    // styles
    style,
    className,
    classNames,
    variant = "default",
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

  const isGroup = !!(checkboxGroup && !skipGroup);

  if (process.env.NODE_ENV !== "production") {
    const warning = devUseWarning("Checkbox");

    warning(
      checked !== undefined || !!checkboxGroup || value === undefined,
      "usage",
      "`value` is not a valid prop, do you mean `checked`?",
    );
  }

  let mergedChecked = checked;

  if (isGroup) {
    mergedChecked = value !== undefined && !!checkboxGroup.value?.includes(value);
  }

  const hasLabelContent = React.Children.toArray(children).some((child) => {
    if (typeof child === "boolean") {
      return false;
    }

    return child !== "";
  });
  const isCardVariant = variant === "card";
  const checkboxName = isGroup ? checkboxGroup.name : restProps.name;

  let labelNode: React.ReactNode = null;

  if (loading) {
    labelNode = <LoadingIcon />;
  } else if (hasLabelContent) {
    labelNode = isCardVariant ? (
      <div
        data-slot="checkbox-label"
        className={cn("grid gap-1.5 leading-snug", classNames?.label)}
      >
        {children}
      </div>
    ) : (
      <span
        data-slot="checkbox-label"
        className={cn("leading-line-height px-2", classNames?.label)}
      >
        {children}
      </span>
    );
  }

  // ============================ Event Lock ============================
  const [onLabelClick, onInputClick] = useBubbleLock(restProps.onClick);

  return (
    <Wave component="Checkbox" disabled={mergedDisabled}>
      <label
        className={cn(
          "inline-flex shrink-0 cursor-pointer text-sm",
          direction === "rtl" ? "flex-row-reverse" : "flex-row",
          isCardVariant
            ? [
                "items-start gap-3 rounded-lg border border-border p-3 transition-colors",
                "hover:bg-accent/50",
                "has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5 dark:has-data-[state=checked]:bg-primary/10",
              ]
            : "items-baseline",
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
            isCardVariant ? "mt-0.5 self-start" : "self-center",
            "disabled:border-black/55 disabled:bg-black/15",
          )}
          value={value as string | undefined}
          checked={indeterminate ? "indeterminate" : mergedChecked}
          defaultChecked={defaultChecked}
          name={checkboxName}
          disabled={mergedDisabled}
          onClick={onInputClick}
          onCheckedChange={(nextChecked) => {
            onChange?.({
              type: "change",
              target: {
                type: "checkbox",
                name: checkboxName,
                value: value as unknown as TValue,
                checked: nextChecked === "indeterminate" ? false : nextChecked,
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

            if (isGroup && checkboxGroup.toggleOption && value !== undefined) {
              checkboxGroup.toggleOption({ label: children, value });
            }
          }}
          {...restProps}
        />
        {labelNode}
      </label>
    </Wave>
  );
}

export type { CheckboxProps, AbstractCheckboxProps };
export { Checkbox };
