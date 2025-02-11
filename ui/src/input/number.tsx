// https://github.com/ant-design/ant-design/tree/master/components/input-number
// Dec 30, 2024
// https://github.com/ant-design/ant-design/commit/39d9c1c6bfb3f2b40eaff9d4c12ba6532139f96f

import type { Ref } from "react";
import React from "react";

import type { SizeType } from "../types";
import type {
  InputNumberProps as RcInputNumberProps,
  ValueType,
} from "./_components/rc-input-number";
import type { InputStatus, InputVariant } from "./types";
import { cn } from "..";
import { Icon } from "../icons";
import { InputNumber as RcInputNumber } from "./_components/rc-input-number";
import { inputSizeVariants, inputVariants } from "./input";

interface InputNumberProps<T extends ValueType = ValueType>
  extends Omit<RcInputNumberProps<T>, "prefix" | "size" | "controls"> {
  ref?: Ref<HTMLInputElement>;
  // prefixCls?: string;
  // rootClassName?: string;
  addonBefore?: React.ReactNode;
  addonAfter?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  size?: SizeType;
  disabled?: boolean;
  /** @deprecated Use `variant` instead. */
  // bordered?: boolean;
  status?: InputStatus;
  controls?: boolean | { upIcon?: React.ReactNode; downIcon?: React.ReactNode };
  /**
   * @since 5.13.0
   * @default "outlined"
   */
  variant?: InputVariant;
}

const InputNumber = ({ ref, ...props }: InputNumberProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useImperativeHandle(ref, () => inputRef.current!);

  const {
    className,
    // rootClassName,
    size: customizeSize,
    disabled: customDisabled,
    // prefixCls: customizePrefixCls,
    addonBefore,
    addonAfter,
    prefix,
    suffix,
    // bordered,
    readOnly,
    status: customStatus,
    controls,
    variant: customVariant,
    ...others
  } = props;

  let upIcon = (
    <Icon icon="icon-[teenyicons--up-solid]" className="h-2 w-3 opacity-70" />
  );
  let downIcon = (
    <Icon icon="icon-[teenyicons--down-solid]" className="h-2 w-3 opacity-70" />
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
      ref={inputRef}
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
      {...others}
    />
  );
};

export { InputNumber };
export type { InputNumberProps };
