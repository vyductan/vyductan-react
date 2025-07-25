/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
"use client";

import * as React from "react";
import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useMergedState } from "@rc-component/util";
import omit from "@rc-component/util/lib/omit";

import type { Variant } from "../config-provider";
import type { SizeType } from "../config-provider/size-context";
import type { HolderRef } from "./_components/base-input";
import type {
  ChangeEventInfo,
  CommonInputProps,
  CountConfig,
  InputRef,
  InputValueType,
  ShowCountFormatter,
} from "./types";
import type { InputFocusOptions } from "./utils/common-utils";
import type { InputStatus } from "./variants";
import { devUseWarning } from "../_util/warning";
import { useComponentConfig } from "../config-provider/context";
import DisabledContext from "../config-provider/disabled-context";
import useSize from "../config-provider/hooks/use-size";
import useVariant from "../form/hooks/use-variant";
import { useCompactItemContext } from "../space/compact";
import { BaseInput } from "./_components/base-input";
import useCount from "./hooks/use-count";
import { resolveOnChange, triggerFocus } from "./utils/common-utils";
import { inputSizeVariants, inputVariants } from "./variants";

type SemanticName = "prefix" | "suffix" | "input" | "count";

type InputProps = Omit<
  React.ComponentProps<"input">,
  "ref" | "size" | "prefix" | "value"
> &
  CommonInputProps & {
    ref?: React.ForwardedRef<InputRef>;

    onPressEnter?: React.KeyboardEventHandler<HTMLInputElement>;
    classNames?: Partial<Record<SemanticName, string>>;
    styles?: Partial<Record<SemanticName, React.CSSProperties>>;
    size?: SizeType;
    status?: InputStatus;
    /** @deprecated Use `variant="borderless"` instead. */
    bordered?: boolean;
    /**
     * @since 5.13.0
     * @default "outlined"
     */
    variant?: Variant;

    // RC
    value?: InputValueType;
    count?: CountConfig;
    showCount?:
      | boolean
      | {
          formatter: ShowCountFormatter;
        };
    htmlSize?: number;
    onClear?: () => void;
  };

const Input = (props: InputProps) => {
  const {
    ref,

    disabled: customDisabled,

    bordered = true,
    size: customSize,
    variant: customVariant,

    status,

    autoComplete,
    onChange,
    onFocus,
    onBlur,
    onPressEnter,
    onKeyDown,
    onKeyUp,
    htmlSize,
    className,
    maxLength,
    suffix,
    showCount,
    count,
    classNames,
    styles,
    onCompositionStart,
    onCompositionEnd,
    ...rest
  } = props;

  if (process.env.NODE_ENV !== "production") {
    const { deprecated } = devUseWarning("Input");
    deprecated(!("bordered" in props), "bordered", "variant");
  }

  const {
    direction,
    // allowClear: contextAllowClear,
    // autoComplete: contextAutoComplete,
    // className: contextClassName,
    // style: contextStyle,
    // classNames: contextClassNames,
    // styles: contextStyles,
  } = useComponentConfig("input");

  //
  const [variant] = useVariant("input", customVariant, bordered);

  /// RC

  const [focused, setFocused] = useState<boolean>(false);
  const compositionRef = useRef(false);
  const keyLockRef = useRef(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const holderRef = useRef<HolderRef>(null);

  const focus = (option?: InputFocusOptions) => {
    if (inputRef.current) {
      triggerFocus(inputRef.current, option);
    }
  };

  // ====================== Value =======================
  const [value, setValue] = useMergedState(props.defaultValue, {
    value: props.value,
  });
  const formatValue =
    value === undefined || value === null ? "" : String(value);

  // ===================== Compact Item =====================
  const { compactSize } = useCompactItemContext(direction);

  // ===================== Size =====================
  const mergedSize = useSize((ctx) => customSize ?? compactSize ?? ctx);

  // ===================== Disabled =====================
  const disabled = React.useContext(DisabledContext);
  const mergedDisabled = customDisabled ?? disabled;

  // =================== Select Range ===================
  const [selection, setSelection] = useState<
    [start: number, end: number] | null
  >(null);

  // ====================== Count =======================
  const countConfig = useCount(count, showCount);
  const mergedMax = countConfig.max || maxLength;
  const valueLength = countConfig.strategy(formatValue);

  const isOutOfRange = !!mergedMax && valueLength > mergedMax;

  // ======================= Ref ========================
  useImperativeHandle(ref, () => ({
    focus,
    blur: () => {
      inputRef.current?.blur();
    },
    setSelectionRange: (
      start: number,
      end: number,
      direction?: "forward" | "backward" | "none",
    ) => {
      inputRef.current?.setSelectionRange(start, end, direction);
    },
    select: () => {
      inputRef.current?.select();
    },
    setCustomValidity: (msg) => inputRef.current?.setCustomValidity?.(msg),
    reportValidity: () => inputRef.current?.reportValidity?.(),
    input: inputRef.current,
    nativeElement: holderRef.current?.nativeElement ?? inputRef.current,
  }));

  useEffect(() => {
    if (keyLockRef.current) {
      keyLockRef.current = false;
    }
    setFocused((prev) => (prev && disabled ? false : prev));
  }, [disabled]);

  const triggerChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.CompositionEvent<HTMLInputElement>,
    currentValue: string,
    info: ChangeEventInfo,
  ) => {
    let cutValue = currentValue;

    if (
      !compositionRef.current &&
      countConfig.exceedFormatter &&
      countConfig.max &&
      countConfig.strategy(currentValue) > countConfig.max
    ) {
      cutValue = countConfig.exceedFormatter(currentValue, {
        max: countConfig.max,
      });

      if (currentValue !== cutValue) {
        setSelection([
          inputRef.current?.selectionStart || 0,
          inputRef.current?.selectionEnd || 0,
        ]);
      }
    } else if (info.source === "compositionEnd") {
      // Avoid triggering twice
      // https://github.com/ant-design/ant-design/issues/46587
      return;
    }
    setValue(cutValue);

    if (inputRef.current) {
      resolveOnChange(inputRef.current, e, onChange, cutValue);
    }
  };

  useEffect(() => {
    if (selection) {
      inputRef.current?.setSelectionRange(...selection);
    }
  }, [selection]);

  const onInternalChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    triggerChange(e, e.target.value, {
      source: "change",
    });
  };

  const onInternalCompositionEnd = (
    e: React.CompositionEvent<HTMLInputElement>,
  ) => {
    compositionRef.current = false;
    triggerChange(e, e.currentTarget.value, {
      source: "compositionEnd",
    });
    onCompositionEnd?.(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (onPressEnter && e.key === "Enter" && !keyLockRef.current) {
      keyLockRef.current = true;
      onPressEnter(e);
    }
    onKeyDown?.(e);
  };
  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      keyLockRef.current = false;
    }
    onKeyUp?.(e);
  };

  const handleFocus: React.FocusEventHandler<HTMLInputElement> = (e) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
    if (keyLockRef.current) {
      keyLockRef.current = false;
    }
    setFocused(false);
    onBlur?.(e);
  };

  const handleReset = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    setValue("");
    focus();
    if (inputRef.current) {
      resolveOnChange(inputRef.current, e, onChange);
    }
  };

  // ====================== Input =======================
  const outOfRangeCls = isOutOfRange && `input-out-of-range`;

  const getInputElement = () => {
    // Fix https://fb.me/react-unknown-prop
    const otherProps = omit(
      props as Omit<InputProps, "value"> & {
        value?: React.InputHTMLAttributes<HTMLInputElement>["value"];
      },
      [
        "onPressEnter",
        "addonBefore",
        "addonAfter",
        "prefix",
        "suffix",
        "allowClear",
        // Input elements must be either controlled or uncontrolled,
        // specify either the value prop, or the defaultValue prop, but not both.
        "defaultValue",
        "showCount",
        "count",
        "htmlSize",
        "styles",
        "classNames",
        "onClear",
      ],
    );
    return (
      <input
        data-slot="input"
        autoComplete={autoComplete}
        {...otherProps}
        onChange={onInternalChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        className={cn(
          "relative inline-block w-full text-sm placeholder-shown:overflow-ellipsis",
          inputSizeVariants({ size: mergedSize }),
          classNames?.input,
        )}
        style={styles?.input}
        ref={inputRef}
        size={htmlSize}
        onCompositionStart={(e) => {
          compositionRef.current = true;
          onCompositionStart?.(e);
        }}
        onClick={(e) => {
          // fix click input in radix dialog not focus correct
          inputRef.current?.focus();
          otherProps.onClick?.(e);
        }}
        onCompositionEnd={onInternalCompositionEnd}
      />
    );
  };

  const getSuffix = () => {
    // Max length value
    const hasMaxLength = Number(mergedMax) > 0;

    if (suffix || countConfig.show) {
      const dataCount = countConfig.showFormatter
        ? countConfig.showFormatter({
            value: formatValue,
            count: valueLength,
            maxLength: mergedMax,
          })
        : `${valueLength}${hasMaxLength ? ` / ${mergedMax}` : ""}`;

      return (
        <>
          {countConfig.show && (
            <span
              className={cn(
                `input-show-count-suffix`,
                {
                  [`input-show-count-has-suffix`]: !!suffix,
                },
                classNames?.count,
              )}
              style={{
                ...styles?.count,
              }}
            >
              {dataCount}
            </span>
          )}
          {suffix}
        </>
      );
    }
    return null;
  };

  return (
    <BaseInput
      {...rest}
      className={cn(className, outOfRangeCls)}
      handleReset={handleReset}
      value={formatValue}
      focused={focused}
      triggerFocus={focus}
      suffix={getSuffix()}
      disabled={mergedDisabled}
      styles={styles}
      ref={holderRef}
      classNames={{
        variant: cn(inputVariants({ variant, status }), classNames?.variant),
        affixWrapper: cn(
          inputSizeVariants({ size: mergedSize }),
          classNames?.affixWrapper,
        ),
      }}
    >
      {getInputElement()}
    </BaseInput>
  );
};

export { Input };
export type { InputProps };
