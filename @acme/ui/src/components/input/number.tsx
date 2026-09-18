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
import useSize from "../config-provider/hooks/use-size";
import { Icon } from "../../icons";
import RcInputNumber from "./components/rc-input-number";
import {
  controlHeightBySize,
  controlPaddingXBySize,
  controlRadiusBySize,
  controlTextBySize,
  inputSizeVariants,
  inputVariants,
} from "./variants";

const NAVIGATION_KEYS = new Set([
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
]);

const CLIPBOARD_KEYS = new Set(["a", "c", "v", "x", "z"]);

// Which characters can build a number in this field. `decimalSeparator` is a
// public prop that rc's parser maps back to "." and its formatter renders on
// blur, so a key filter that only ever allowed "." made the prop unusable: the
// value could be displayed with a comma but never typed. "." stays allowed
// either way because the parser treats it as canonical.
const isNumberEntryKey = (key: string, decimalSeparator: string | undefined) =>
  /^[0-9]$/.test(key) || key === "." || key === (decimalSeparator ?? ".");

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
  /**
   * Horizontal alignment of the value text inside the field.
   * Handy for right-aligned currency / accounting inputs.
   * @default "left"
   */
  align?: "left" | "center" | "right";
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
    align = "left",
    decimalSeparator,

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
        mode === "spinner"
          ? "text-muted-foreground h-4 w-4 opacity-70"
          : "text-muted-foreground h-2.5 w-4 opacity-70"
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
        mode === "spinner"
          ? "text-muted-foreground h-4 w-4 opacity-70"
          : "text-muted-foreground h-2.5 w-4 opacity-70"
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

  const mergedStatus =
    customStatus ?? (others["aria-invalid"] ? "error" : undefined);
  const mergedSize = useSize((context) => customizeSize ?? context);
  const spinnerMode = mode === "spinner";

  // ===================== Disabled =====================
  const mergedDisabled = customDisabled;

  // Check if has addon to conditionally apply variant
  const hasAddon = !spinnerMode && !!(addonBefore ?? addonAfter);

  // Check if has affix (prefix/suffix/allowClear) - when true, affixWrapper is rendered
  const hasAffix = !!(!!prefix || !!suffix || (!spinnerMode && !!allowClear));
  const spinnerSizeClassNameBySize: Record<NonNullable<SizeType>, string> = {
    small: controlHeightBySize.small,
    middle: cn(controlHeightBySize.middle, controlTextBySize.middle),
    large: cn(controlHeightBySize.large, controlTextBySize.large),
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
      decimalSeparator={decimalSeparator}
      mode={mode}
      disabled={mergedDisabled}
      className={
        cn(
          // Only apply variant to outer element when no addon
          !hasAddon &&
            inputVariants({ status: mergedStatus, variant: customVariant }),
          !hasAddon && controlRadiusBySize[mergedSize ?? "middle"],
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
          !spinnerMode &&
            { left: "text-left", center: "text-center", right: "text-right" }[
              align
            ],
          "bg-transparent",
          "text-foreground",
          // "placeholder:text-muted-foreground",
          "placeholder:text-placeholder",
          "border-none outline-hidden",
          !spinnerMode && "w-px",
          // With addons the size variant moves to the wrapper, and BaseInput
          // forces the wrapper to p-0 so the addons can touch the border. That
          // leaves the value flush against the border unless the inline inset is
          // restored here (plain Input keeps it via inputSizeVariants).
          hasAddon && controlPaddingXBySize[mergedSize ?? "middle"],
        ),
        // When has addon, apply variant and size to wrapper instead
        variant: cn(
          hasAddon &&
            inputVariants({ status: mergedStatus, variant: customVariant }),
          hasAddon && controlRadiusBySize[mergedSize ?? "middle"],
          hasAddon && inputSizeVariants({ size: mergedSize }),
          readOnly && "cursor-default bg-muted",
        ),
        // {
        //   [`${prefixCls}-${variant}`]: enableVariantCls,
        // },
        // getStatusClassNames(prefixCls, mergedStatus, hasFeedback),
        affixWrapper: cn(
          hasAffix && inputSizeVariants({ size: mergedSize }),
          // The affix wrapper only exists when something fills a prefix/suffix
          // slot (prefix, suffix, clear icon, or the spinner controls), and with
          // allowClear that flips with the value. So when it IS rendered it takes
          // over the inset from the input via an element-scoped selector, which
          // outranks the input's own px-* regardless of class order.
          hasAddon &&
            cn(
              controlPaddingXBySize[mergedSize ?? "middle"],
              controlTextBySize[mergedSize ?? "middle"],
              "[&_input]:px-0",
            ),
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
        const allowed =
          NAVIGATION_KEYS.has(e.key) ||
          // Ctrl/Cmd + A, C, V, X, Z
          ((e.metaKey || e.ctrlKey) &&
            CLIPBOARD_KEYS.has(e.key.toLowerCase())) ||
          isNumberEntryKey(e.key, decimalSeparator) ||
          // Minus sign only at the start of input
          (e.key === "-" &&
            (!e.currentTarget.value || e.currentTarget.selectionStart === 0));

        if (!allowed) {
          e.preventDefault();
        }

        // Always forward. This used to run only for the keys that had just been
        // blocked, so a caller's handler never saw a digit or Enter.
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
