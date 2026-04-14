import * as React from "react";

import type { CheckboxGroupContext, CheckboxValueType } from "./group-context";
import { devUseWarning as developmentUseWarning } from "../_util/warning";
import { cn } from "../../lib/utils";
import Wave from "../../lib/wave";
import { Checkbox as ShadcnCheckbox } from "../../shadcn/checkbox";
import { LoadingIcon } from "../button/loading-icon";
import { ConfigContext } from "../config-provider/context";
import DisabledContext from "../config-provider/disabled-context";
import { inputDisabledVariants, inputSizeVariants } from "../input/variants";
import { Label } from "../label/label";
import GroupContext from "./group-context";
import useBubbleLock from "./use-bubble-lock";

type AbstractCheckboxProperties<
  TChangeEvent,
  TValue extends CheckboxValueType = CheckboxValueType,
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
  required?: boolean;

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
  TValue extends CheckboxValueType = CheckboxValueType,
> extends Omit<CheckboxProperties<TValue>, "value"> {
  checked: boolean;
  name?: string;
  type: "checkbox" | "radio";
  value: TValue;
}

export interface CheckboxChangeEvent<
  TValue extends CheckboxValueType = CheckboxValueType,
> {
  type: "change";
  target: CheckboxChangeEventTarget<TValue>;
  stopPropagation: () => void;
  preventDefault: () => void;
  nativeEvent: MouseEvent;
}

type CheckboxProperties<TValue extends CheckboxValueType = CheckboxValueType> =
  AbstractCheckboxProperties<CheckboxChangeEvent<TValue>, TValue> &
    React.AriaAttributes & {
      key?: React.Key; // fix warning when use key (shadcn)
      indeterminate?: boolean;
      variant?: "default" | "card";
      size?: "small" | "middle" | "large";
    };

function Checkbox<TValue extends CheckboxValueType = CheckboxValueType>(
  properties: CheckboxProperties<TValue>,
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
    size = "middle",
    // render
    children,

    skipGroup,

    // on
    // onClick,
    onChange,
    onMouseEnter,
    onMouseLeave,
    ...restProperties
  } = properties;

  const { direction, checkbox } = React.useContext(ConfigContext);
  const checkboxGroup = React.useContext(
    GroupContext as unknown as React.Context<
      CheckboxGroupContext<TValue> | undefined
    >,
  );
  const contextDisabled = React.useContext(DisabledContext);
  const mergedDisabled = checkboxGroup?.disabled ?? disabled ?? contextDisabled;

  const isGroup = !!(checkboxGroup && !skipGroup);

  if (process.env.NODE_ENV !== "production") {
    const warning = developmentUseWarning("Checkbox");

    warning(
      checked !== undefined || !!checkboxGroup || value === undefined,
      "usage",
      "`value` is not a valid prop, do you mean `checked`?",
    );
  }

  const mergedChecked = isGroup
    ? value === undefined
      ? false
      : !!checkboxGroup.value?.includes(value)
    : checked;

  const hasLabelContent = React.Children.toArray(children).some((child) => {
    if (typeof child === "boolean") {
      return false;
    }

    return child !== "";
  });

  // ============================ Event Lock ============================
  const [onLabelClick, onInputClick] = useBubbleLock(restProperties.onClick);

  return (
    <Wave component="Checkbox" disabled={mergedDisabled}>
      <Label
        className={cn(
          "inline-flex shrink-0 cursor-pointer items-baseline text-sm",
          direction === "rtl" ? "flex-row-reverse" : "flex-row",
          variant === "card" && [
            "hover:bg-accent/50 items-start gap-2 rounded-md border",
            inputSizeVariants({ size }),
            "h-auto",
            size === "small"
              ? "py-1.5 px-2.5 min-h-6"
              : size === "large"
                ? "py-3 px-4 min-h-10"
                : "py-2 px-3 min-h-8",
            "has-aria-checked:border-primary-600 has-aria-checked:bg-primary-50",
            "dark:has-aria-checked:border-primary-900 dark:has-aria-checked:bg-primary-950",
          ],
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
            variant === "card" ? "self-start" : "self-center",
            "disabled:border-black/55 disabled:bg-black/15",
            variant === "card" && [
              "data-[state=checked]:border-primary-600 data-[state=checked]:bg-primary-600 data-[state=checked]:text-white",
              "dark:data-[state=checked]:border-primary-700 dark:data-[state=checked]:bg-primary-700",
            ],
          )}
          value={value as string | undefined}
          checked={indeterminate ? "indeterminate" : mergedChecked}
          defaultChecked={defaultChecked}
          name={isGroup ? checkboxGroup.name : restProperties.name}
          disabled={mergedDisabled}
          onClick={onInputClick}
          onCheckedChange={(nextChecked) => {
            onChange?.({
              type: "change",
              target: {
                type: "checkbox",
                name: isGroup ? checkboxGroup.name : restProperties.name,
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
          {...restProperties}
        />
        {loading ? <LoadingIcon /> : undefined}
        {!loading &&
          hasLabelContent &&
          (variant === "card" ? (
            <div
              data-slot="checkbox-label"
              className={cn(
                "mt-px flex flex-col gap-0.5 w-full",
                "leading-none font-medium",
                classNames?.label,
              )}
            >
              {children}
            </div>
          ) : (
            <span
              data-slot="checkbox-label"
              className={cn("px-2 leading-none", classNames?.label)}
            >
              {children}
            </span>
          ))}
      </Label>
    </Wave>
  );
}

export type {
  CheckboxProperties as CheckboxProps,
  AbstractCheckboxProperties as AbstractCheckboxProps,
};
export { Checkbox };
