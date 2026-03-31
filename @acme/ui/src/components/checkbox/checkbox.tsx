import * as React from "react";

import { cn } from "../../lib/utils";
import { Checkbox as ShadcnCheckbox } from "../../shadcn/checkbox";

import type { CheckboxGroupContext, CheckboxValueType } from "./group-context";
import { devUseWarning } from "../_util/warning";
import Wave from "../../lib/wave";
import { LoadingIcon } from "../button/loading-icon";
import { ConfigContext } from "../config-provider/context";
import DisabledContext from "../config-provider/disabled-context";
import { inputDisabledVariants } from "../input/variants";
import { Label } from "../label/label";
import GroupContext from "./group-context";
import useBubbleLock from "./use-bubble-lock";

type AbstractCheckboxProps<
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
> extends Omit<CheckboxProps<TValue>, "value"> {
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

type CheckboxProps<TValue extends CheckboxValueType = CheckboxValueType> =
  AbstractCheckboxProps<CheckboxChangeEvent<TValue>, TValue> &
    React.AriaAttributes & {
      key?: React.Key; // fix warning when use key (shadcn)
      indeterminate?: boolean;
      variant?: "default" | "card";
    };

function Checkbox<TValue extends CheckboxValueType = CheckboxValueType>(
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
  const [onLabelClick, onInputClick] = useBubbleLock(restProps.onClick);

  return (
    <Wave component="Checkbox" disabled={mergedDisabled}>
      <Label
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
          checked={indeterminate ? "indeterminate" : mergedChecked}
          defaultChecked={defaultChecked}
          name={isGroup ? checkboxGroup.name : restProps.name}
          disabled={mergedDisabled}
          onClick={onInputClick}
          onCheckedChange={(nextChecked) => {
            onChange?.({
              type: "change",
              target: {
                type: "checkbox",
                name: isGroup ? checkboxGroup.name : restProps.name,
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
        {loading ? (
          <LoadingIcon />
        ) : hasLabelContent ? (
          variant === "card" ? (
            <div
              data-slot="checkbox-label"
              className={cn("leading-line-height px-2", classNames?.label)}
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
          )
        ) : null}
      </Label>
    </Wave>
  );
}

export type { CheckboxProps, AbstractCheckboxProps };
export { Checkbox };
