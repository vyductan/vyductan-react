import * as React from "react";

import { cn } from "@acme/ui/lib/utils";
import { Checkbox as ShadcnCheckbox } from "@acme/ui/shadcn/checkbox";

import { devUseWarning } from "../_util/warning";
import Wave from "../../lib/wave";
import { LoadingIcon } from "../button";
import { ConfigContext } from "../config-provider/context";
import DisabledContext from "../config-provider/disabled-context";
import { inputDisabledVariants } from "../input";
import GroupContext from "./group-context";
import useBubbleLock from "./use-bubble-lock";

type AbstractCheckboxProps<T> = {
  id?: string;
  name?: string;

  // value
  value?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (e: T) => void;
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
export interface CheckboxChangeEventTarget extends CheckboxProps {
  checked: boolean;
  name?: string;
  type: "checkbox" | "radio";
}

export interface CheckboxChangeEvent {
  type: "change";
  target: CheckboxChangeEventTarget;
  stopPropagation: () => void;
  preventDefault: () => void;
  nativeEvent: MouseEvent;
}

type CheckboxProps = AbstractCheckboxProps<CheckboxChangeEvent> &
  React.AriaAttributes & {
    key?: React.Key; // fix warning when use key (shadcn)
    indeterminate?: boolean;
  };

const Checkbox = (props: CheckboxProps) => {
  const {
    // id,
    // "aria-describedby": ariaDescribedBy,
    // "aria-invalid": ariaInvalid,

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
  const checkboxGroup = React.useContext(GroupContext);
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

  const checkboxProps: CheckboxProps = { ...restProps };
  if (checkboxGroup && !skipGroup) {
    checkboxProps.onChange = (...args) => {
      if (onChange) {
        onChange(...args);
      }
      if (checkboxGroup.toggleOption) {
        checkboxGroup.toggleOption({ label: children, value: restProps.value });
      }
    };
    checkboxProps.name = checkboxGroup.name;
    checkboxProps.checked = restProps.value
      ? checkboxGroup.value?.includes(restProps.value)
      : false;
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
          checked={indeterminate ? "indeterminate" : restProps.checked}
          disabled={mergedDisabled}
          onClick={onInputClick}
          onCheckedChange={(checked) => {
            onChange?.({
              type: "change",
              target: {
                type: "checkbox",
                name: props.name,
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
