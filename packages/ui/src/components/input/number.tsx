/* eslint-disable @typescript-eslint/no-non-null-assertion */
// https://github.com/ant-design/ant-design/tree/master/components/input-number
// Dec 30, 2024
// https://github.com/ant-design/ant-design/commit/39d9c1c6bfb3f2b40eaff9d4c12ba6532139f96f

import React from "react";

import { cn } from "@acme/ui/lib/utils";

import type { SizeType } from "../config-provider/size-context";
import type {
  ValueType as NumberValueType,
  InputNumberProps as RcInputNumberProperties,
} from "./components/rc-input-number";
import type { InputStatus, InputVariant } from "./variants";
import { Icon } from "../../icons";
import RcInputNumber from "./components/rc-input-number";
import { inputSizeVariants, inputVariants } from "./variants";

interface InputNumberProperties<
  TNumberValue extends NumberValueType = NumberValueType,
> extends Omit<
  RcInputNumberProperties<TNumberValue>,
  "ref" | "prefix" | "size" | "controls"
> {
  ref?: React.Ref<HTMLInputElement>;

  addonBefore?: React.ReactNode;
  addonAfter?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  size?: SizeType;
  disabled?: boolean;
  status?: InputStatus;
  controls?: boolean | { upIcon?: React.ReactNode; downIcon?: React.ReactNode };
  mode?: "input" | "spinner";
  /**
   * @since 5.13.0
   * @default "outlined"
   */
  variant?: InputVariant;
  allowClear?: boolean | { clearIcon?: React.ReactNode };
}

const InputNumber = <TNumberValue extends NumberValueType = NumberValueType>({
  ref,
  ...properties
}: InputNumberProperties<TNumberValue>) => {
  const inputReference = React.useRef<HTMLInputElement>(null);

  React.useImperativeHandle(ref, () => inputReference.current!);

  const {
    className,
    size: customizeSize,
    disabled: customDisabled,
    addonBefore,
    addonAfter,
    prefix,
    suffix,
    readOnly,
    status: customStatus,
    controls,
    mode = "input",
    variant: customVariant,
    allowClear,

    onKeyDown,
    onChange,

    ...others
  } = properties;

  let upIcon = (
    <Icon
      icon={
        mode === "spinner"
          ? "icon-[lucide--plus]"
          : "icon-[fluent-mdl2--caret-up-solid-8]"
      }
      className={
        mode === "spinner" ? "h-4 w-4 opacity-70" : "h-2.5 w-4 opacity-70"
      }
    />
  );
  let downIcon = (
    <Icon
      icon={
        mode === "spinner"
          ? "icon-[lucide--minus]"
          : "icon-[teenyicons--down-solid]"
      }
      className={
        mode === "spinner" ? "h-4 w-4 opacity-70" : "h-2.5 w-4 opacity-70"
      }
    />
  );
  const controlsTemporary =
    typeof controls === "boolean" ? controls : undefined;

  if (typeof controls === "object") {
    upIcon =
      controls.upIcon === undefined ? upIcon : <span>{controls.upIcon}</span>;
    downIcon =
      controls.downIcon === undefined ? (
        downIcon
      ) : (
        <span>{controls.downIcon}</span>
      );
  }

  const mergedStatus = customStatus;
  const mergedSize = customizeSize;
  const spinnerMode = mode === "spinner";

  // ===================== Disabled =====================
  const mergedDisabled = customDisabled;

  // Check if has addon to conditionally apply variant
  const hasAddon = !spinnerMode && !!(addonBefore ?? addonAfter);

  // Check if has affix (prefix/suffix/allowClear) - when true, affixWrapper is rendered
  const hasAffix = !!(!!prefix || !!suffix || (!spinnerMode && !!allowClear));
  const spinnerSizeClassNameBySize: Record<NonNullable<SizeType>, string> = {
    small: "h-6",
    middle: "h-8 text-sm",
    large: "h-10 text-base",
  };
  const spinnerSizeClass = spinnerMode
    ? spinnerSizeClassNameBySize[mergedSize ?? "middle"]
    : undefined;

  //  const suffixNode = hasFeedback && <>{feedbackIcon}</>;

  return (
    <RcInputNumber<TNumberValue>
      // ref={ref}
      upHandler={upIcon}
      downHandler={downIcon}
      // prefixCls={prefixCls}
      readOnly={readOnly}
      controls={controlsTemporary}
      prefix={prefix}
      suffix={suffix}
      addonBefore={spinnerMode ? undefined : addonBefore}
      // addonBefore={
      //   addonBefore && (
      //     <ContextIsolator form space>
      //       {addonBefore}
      //     </ContextIsolator>
      //   )
      // }
      addonAfter={spinnerMode ? undefined : addonAfter}
      // addonAfter={
      //   addonAfter && (
      //     <ContextIsolator form space>
      //       {addonAfter}
      //     </ContextIsolator>
      //   )
      // }
      allowClear={spinnerMode ? undefined : allowClear}
      mode={mode}
      disabled={mergedDisabled}
      className={
        cn(
          // Only apply variant to outer element when no addon
          !hasAddon &&
            inputVariants({ status: mergedStatus, variant: customVariant }),
          // Spinner mode owns its inner layout; do not add input shell padding to the group root
          !hasAddon && !spinnerMode && inputSizeVariants({ size: mergedSize }),
          spinnerSizeClass,
          className,
        )
        // cssVarCls, rootCls, className, rootClassName, compactItemClassnames
      }
      classNames={{
        input: cn(
          "flex-1",
          spinnerMode && "min-w-0 w-full",
          !spinnerMode && "text-left",
          "bg-transparent",
          // "placeholder:text-muted-foreground",
          "placeholder:text-placeholder",
          "border-none outline-hidden",
          !spinnerMode && "w-px",
          // Add padding when has addon (match Input behavior)
          // hasAddon && addonBefore && "pl-[11px]",
          // hasAddon && addonAfter && "pr-[11px]",
          // hasAddon && !addonBefore && "pl-[11px]",
          // hasAddon && !addonAfter && "pr-[11px]",
        ),
        // When has addon, apply variant and size to wrapper instead
        variant: cn(
          hasAddon &&
            inputVariants({ status: mergedStatus, variant: customVariant }),
          hasAddon && inputSizeVariants({ size: mergedSize }),
          readOnly && "cursor-default bg-muted",
        ),
        // {
        //   [`${prefixCls}-${variant}`]: enableVariantCls,
        // },
        // getStatusClassNames(prefixCls, mergedStatus, hasFeedback),
        affixWrapper: cn(
          hasAffix && inputSizeVariants({ size: mergedSize }),
          readOnly && "cursor-default bg-muted",
        ),
        // {
        //   [`${prefixCls}-affix-wrapper-sm`]: mergedSize === 'small',
        //   [`${prefixCls}-affix-wrapper-lg`]: mergedSize === 'large',
        //   [`${prefixCls}-affix-wrapper-rtl`]: direction === 'rtl',
        //   [`${prefixCls}-affix-wrapper-without-controls`]: controls === false,
        // },
        // hashId,
        wrapper: cn(),
        // {
        //   [`${wrapperClassName}-rtl`]: direction === 'rtl',
        // },
        // hashId,
        groupWrapper: cn(),
        // {
        //   [`${prefixCls}-group-wrapper-sm`]: mergedSize === 'small',
        //   [`${prefixCls}-group-wrapper-lg`]: mergedSize === 'large',
        //   [`${prefixCls}-group-wrapper-rtl`]: direction === 'rtl',
        //   [`${prefixCls}-group-wrapper-${variant}`]: enableVariantCls,
        // },
        // getStatusClassNames(`${prefixCls}-group-wrapper`, mergedStatus, hasFeedback),
        // hashId,
      }}
      // prevent user enter non-numeric characters || https://stackoverflow.com/a/74850574
      onKeyDown={(e) => {
        // Allow: backspace, delete, tab, escape, enter, arrows, home, end, ctrl/cmd+a, ctrl/cmd+c, ctrl/cmd+v, ctrl/cmd+x
        if (
          // Navigation and control keys
          [
            "Backspace",
            "Delete",
            "Tab",
            "Escape",
            "Enter",
            "ArrowLeft",
            "ArrowRight",
            "ArrowUp",
            "ArrowDown",
            "Home",
            "End",
          ].includes(e.key) ||
          // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
          ((e.metaKey || e.ctrlKey) &&
            ["a", "c", "v", "x", "z"].includes(e.key)) ||
          // Allow: numbers, numpad numbers
          /^[0-9]$/.test(e.key) ||
          // Allow: decimal point
          e.key === "." ||
          // Allow: minus sign only at the start of input
          (e.key === "-" &&
            (!e.currentTarget.value || e.currentTarget.selectionStart === 0))
        ) {
          // Let it happen, don't do anything
          return;
        }

        // Block the key press if it's a letter or other character
        e.preventDefault();
        onKeyDown?.(e);
      }}
      onChange={onChange}
      {...others}
    />
  );
};

export { InputNumber };
export type { InputNumberProperties as InputNumberProps };

export { type ValueType as NumberValueType } from "./components/rc-input-number";
