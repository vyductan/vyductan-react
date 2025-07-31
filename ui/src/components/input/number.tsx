// https://github.com/ant-design/ant-design/tree/master/components/input-number
// Dec 30, 2024
// https://github.com/ant-design/ant-design/commit/39d9c1c6bfb3f2b40eaff9d4c12ba6532139f96f

import React from "react";

import { cn } from "@acme/ui/lib/utils";

import type { SizeType } from "../../types";
import type {
  ValueType as NumberValueType,
  InputNumberProps as RcInputNumberProps,
} from "./_components/rc-input-number";
import type { InputStatus, InputVariant } from "./variants";
import { Icon } from "../../icons";
import RcInputNumber from "./_components/rc-input-number";
import { inputSizeVariants, inputVariants } from "./variants";

interface InputNumberProps<
  TNumberValue extends NumberValueType = NumberValueType,
> extends Omit<
    RcInputNumberProps<TNumberValue>,
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
  /**
   * @since 5.13.0
   * @default "outlined"
   */
  variant?: InputVariant;
}

const InputNumber = <TNumberValue extends NumberValueType = NumberValueType>({
  ref,
  ...props
}: InputNumberProps<TNumberValue>) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useImperativeHandle(ref, () => inputRef.current!);

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
    variant: customVariant,

    onKeyDown,
    onChange,

    ...others
  } = props;

  let upIcon = (
    <Icon
      icon="icon-[fluent-mdl2--caret-up-solid-8]"
      className="h-2.5 w-4 opacity-70"
    />
  );
  let downIcon = (
    <Icon
      icon="icon-[teenyicons--down-solid]"
      className="h-2.5 w-4 opacity-70"
    />
  );
  const controlsTemporary =
    typeof controls === "boolean" ? controls : undefined;

  if (typeof controls === "object") {
    upIcon =
      controls.upIcon === undefined ? (
        upIcon
      ) : (
        <span
        // className={`${prefixCls}-handler-up-inner`}
        >
          {controls.upIcon}
        </span>
      );
    downIcon =
      controls.downIcon === undefined ? (
        downIcon
      ) : (
        <span
        // className={`${prefixCls}-handler-down-inner`}
        >
          {controls.downIcon}
        </span>
      );
  }

  const mergedStatus = customStatus;
  const mergedSize = customizeSize;

  // ===================== Disabled =====================
  const mergedDisabled = customDisabled;

  //  const suffixNode = hasFeedback && <>{feedbackIcon}</>;

  return (
    <RcInputNumber
      // ref={ref}
      upHandler={upIcon}
      downHandler={downIcon}
      // prefixCls={prefixCls}
      readOnly={readOnly}
      controls={controlsTemporary}
      prefix={prefix}
      suffix={suffix}
      addonBefore={addonBefore}
      // addonBefore={
      //   addonBefore && (
      //     <ContextIsolator form space>
      //       {addonBefore}
      //     </ContextIsolator>
      //   )
      // }
      addonAfter={addonAfter}
      // addonAfter={
      //   addonAfter && (
      //     <ContextIsolator form space>
      //       {addonAfter}
      //     </ContextIsolator>
      //   )
      // }

      disabled={mergedDisabled}
      className={
        cn(
          inputVariants({ status: mergedStatus, variant: customVariant }),
          inputSizeVariants({ size: mergedSize }),
          className,
        )
        // cssVarCls, rootCls, className, rootClassName, compactItemClassnames
      }
      classNames={{
        input: cn(
          "flex-1",
          "text-left",
          "bg-transparent",
          // "placeholder:text-muted-foreground",
          "placeholder:text-placeholder",
          "border-none outline-hidden",
        ),
        // inputSizeVariants({ size: mergedSize })
        variant: cn(),
        // {
        //   [`${prefixCls}-${variant}`]: enableVariantCls,
        // },
        // getStatusClassNames(prefixCls, mergedStatus, hasFeedback),
        affixWrapper: cn(),
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
          ((e.metaKey || e.ctrlKey) && ["a", "c", "v", "x"].includes(e.key)) ||
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
export type { InputNumberProps };

export { type ValueType as NumberValueType } from "./_components/rc-input-number";
