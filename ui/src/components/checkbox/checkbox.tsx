import * as React from "react";

import { cn } from "@acme/ui/lib/utils";
import { Checkbox as ShadcnCheckbox } from "@acme/ui/shadcn/checkbox";

import { devUseWarning } from "../_util/warning";
import Wave from "../../lib/wave";
import { LoadingIcon } from "../button";
import { ConfigContext } from "../config-provider/context";
import DisabledContext from "../config-provider/disabled-context";
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
  className?: string;
  style?: React.CSSProperties;

  // render
  children?: React.ReactNode;

  // config
  skipGroup?: boolean;
};
export interface CheckboxChangeEventTarget extends CheckboxProps {
  checked: boolean;
}

export interface CheckboxChangeEvent {
  target: CheckboxChangeEventTarget;
  stopPropagation: () => void;
  preventDefault: () => void;
  nativeEvent: MouseEvent;
}

type CheckboxProps = AbstractCheckboxProps<CheckboxChangeEvent> &
  React.AriaAttributes & {
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
    checked,
    // defaultChecked,

    // styles
    className,
    style,
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
          "inline-flex items-center space-x-2",
          direction === "rtl" ? "flex-row-reverse" : "flex-row",
          className,
        )}
        style={{ ...checkbox?.style, ...style }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onLabelClick}
      >
        <ShadcnCheckbox
          checked={indeterminate ? "indeterminate" : checked}
          onClick={onInputClick}
          className={cn("data-[state=indeterminate]:bg-muted")}
          onCheckedChange={(checked) => {
            onChange?.({
              target: {
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
        {loading ? <LoadingIcon /> : children}
      </label>
    </Wave>
  );
};

export type { CheckboxProps, AbstractCheckboxProps };
export { Checkbox };
