"use client";

import * as React from "react";
import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { useMergedState } from "@rc-component/util";
import omit from "@rc-component/util/es/omit";

import { cn } from "@acme/ui/lib/utils";

import type { Variant } from "../config-provider";
import type { SizeType } from "../config-provider/size-context";
import type { HolderRef as HolderReference } from "./components/base-input";
import type {
  ChangeEventInfo,
  CommonInputProps as CommonInputProperties,
  CountConfig,
  InputRef as InputReference,
  InputValueType,
  ShowCountFormatter,
} from "./types";
import type { InputFocusOptions } from "./utils/common-utils";
import type { InputStatus } from "./variants";
import { devUseWarning as developmentUseWarning } from "../_util/warning";
import { useComponentConfig } from "../config-provider/context";
import DisabledContext from "../config-provider/disabled-context";
import useSize from "../config-provider/hooks/use-size";
import useVariant from "../form/hooks/use-variant";
import { useCompactItemContext } from "../space/compact";
import { BaseInput } from "./components/base-input";
import useCount from "./hooks/use-count";
import { resolveOnChange, triggerFocus } from "./utils/common-utils";
import { inputSizeVariants, inputVariants } from "./variants";

type SemanticName = "prefix" | "suffix" | "input" | "count";

type InputProperties = Omit<
  React.ComponentProps<"input">,
  "ref" | "size" | "prefix" | "value"
> &
  CommonInputProperties & {
    ref?: React.Ref<InputReference | HTMLInputElement | null>;

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

const Input = (properties: InputProperties) => {
  const {
    ref,

    disabled: customDisabled,

    bordered = true,
    size: customSize,
    variant: customVariant,

    status,

    autoComplete = "off",
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
  } = properties;

  if (process.env.NODE_ENV !== "production") {
    const { deprecated } = developmentUseWarning("Input");
    deprecated(!("bordered" in properties), "bordered", "variant");
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
  const compositionReference = useRef(false);
  const keyLockReference = useRef(false);

  const inputReference = useRef<HTMLInputElement>(null);
  const holderReference = useRef<HolderReference>(null);

  const focus = (option?: InputFocusOptions) => {
    if (inputReference.current) {
      triggerFocus(inputReference.current, option);
    }
  };

  // ====================== Value =======================
  const [value, setValue] = useMergedState(properties.defaultValue, {
    value: properties.value,
  });
  const formatValue =
    value === undefined || value === null ? "" : String(value);

  // ===================== Compact Item =====================
  const { compactSize } = useCompactItemContext(direction);

  // ===================== Size =====================
  const mergedSize = useSize((context) => customSize ?? compactSize ?? context);

  // ===================== Disabled =====================
  const disabledFromContext = React.useContext(DisabledContext);
  const disabled = customDisabled ?? disabledFromContext;

  // =================== Select Range ===================
  const [selection, setSelection] = useState<
    [start: number, end: number] | null
  >();

  // ====================== Count =======================
  const countConfig = useCount(count, showCount);
  const mergedMax = countConfig.max || maxLength;
  const valueLength = countConfig.strategy(formatValue);

  const isOutOfRange = !!mergedMax && valueLength > mergedMax;

  // ======================= Ref ========================
  useImperativeHandle<
    InputReference | HTMLInputElement | null,
    InputReference | HTMLInputElement | null
  >(ref, () =>
    inputReference.current
      ? {
          ...inputReference.current,
          focus,
          blur: () => {
            inputReference.current?.blur();
          },
          setSelectionRange: (
            start: number,
            end: number,
            direction?: "forward" | "backward" | "none",
          ) => {
            inputReference.current?.setSelectionRange(start, end, direction);
          },
          select: () => {
            inputReference.current?.select();
          },
          setCustomValidity: (message) =>
            inputReference.current?.setCustomValidity?.(message),
          reportValidity: () => inputReference.current?.reportValidity?.(),
          input: inputReference.current,
          nativeElement:
            holderReference.current?.nativeElement ?? inputReference.current,
        }
      : null,
  );
  // useImperativeHandle(ref, () =>
  //   typeof ref === "object" && ref?.current && "current" in ref.current
  //     ? {
  //         focus,
  //         blur: () => {
  //           inputRef.current?.blur();
  //         },
  //         setSelectionRange: (
  //           start: number,
  //           end: number,
  //           direction?: "forward" | "backward" | "none",
  //         ) => {
  //           inputRef.current?.setSelectionRange(start, end, direction);
  //         },
  //         select: () => {
  //           inputRef.current?.select();
  //         },
  //         setCustomValidity: (msg) =>
  //           inputRef.current?.setCustomValidity?.(msg),
  //         reportValidity: () => inputRef.current?.reportValidity?.(),
  //         input: inputRef.current,
  //         nativeElement: holderRef.current?.nativeElement ?? inputRef.current,
  //       }
  //     : ref,
  // );

  useEffect(() => {
    if (keyLockReference.current) {
      keyLockReference.current = false;
    }
    if (disabledFromContext && focused && inputReference.current) {
      inputReference.current.blur();
    }
  }, [disabledFromContext, focused]);

  const triggerChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.CompositionEvent<HTMLInputElement>,
    currentValue: string,
    info: ChangeEventInfo,
  ) => {
    let cutValue = currentValue;

    if (
      !compositionReference.current &&
      countConfig.exceedFormatter &&
      countConfig.max &&
      countConfig.strategy(currentValue) > countConfig.max
    ) {
      cutValue = countConfig.exceedFormatter(currentValue, {
        max: countConfig.max,
      });

      if (currentValue !== cutValue) {
        setSelection([
          inputReference.current?.selectionStart || 0,
          inputReference.current?.selectionEnd || 0,
        ]);
      }
    } else if (info.source === "compositionEnd") {
      // Avoid triggering twice
      // https://github.com/ant-design/ant-design/issues/46587
      return;
    }
    setValue(cutValue);

    if (inputReference.current) {
      resolveOnChange(inputReference.current, e, onChange, cutValue);
    }
  };

  useEffect(() => {
    if (selection) {
      inputReference.current?.setSelectionRange(...selection);
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
    compositionReference.current = false;
    triggerChange(e, e.currentTarget.value, {
      source: "compositionEnd",
    });
    onCompositionEnd?.(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (onPressEnter && e.key === "Enter" && !keyLockReference.current) {
      keyLockReference.current = true;
      onPressEnter(e);
    }
    onKeyDown?.(e);
  };
  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      keyLockReference.current = false;
    }
    onKeyUp?.(e);
  };

  const handleFocus: React.FocusEventHandler<HTMLInputElement> = (e) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
    if (keyLockReference.current) {
      keyLockReference.current = false;
    }
    setFocused(false);
    onBlur?.(e);
  };

  const handleReset = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    setValue("");
    focus();
    if (inputReference.current) {
      resolveOnChange(inputReference.current, e, onChange);
    }
  };

  // ====================== Input =======================
  const outOfRangeCls = isOutOfRange && `input-out-of-range`;

  const getInputElement = () => {
    // Fix https://fb.me/react-unknown-prop
    const otherProperties = omit(
      properties as Omit<InputProperties, "value"> & {
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
        "status",
      ],
    );
    return (
      <input
        data-slot="input"
        autoComplete={autoComplete}
        aria-invalid={properties["aria-invalid"] ?? status === "error"}
        {...otherProperties}
        onChange={onInternalChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        className={cn(
          "relative inline-block w-full text-sm placeholder-shown:overflow-ellipsis",
          !hasAffix && inputSizeVariants({ size: mergedSize }),
          otherProperties.readOnly && "bg-muted cursor-default",
          classNames?.input,
        )}
        style={styles?.input}
        ref={inputReference}
        size={htmlSize}
        onCompositionStart={(e) => {
          compositionReference.current = true;
          onCompositionStart?.(e);
        }}
        onClick={(e) => {
          // fix click input in radix dialog not focus correct
          inputReference.current?.focus();
          otherProperties.onClick?.(e);
        }}
        onCompositionEnd={onInternalCompositionEnd}
      />
    );
  };

  // Check if has affix (prefix/suffix/allowClear)
  const hasAffix = !!(
    rest.prefix ||
    suffix ||
    rest.allowClear ||
    countConfig.show
  );

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
    return;
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
      disabled={disabled}
      styles={styles}
      ref={holderReference}
      classNames={{
        variant: cn(
          inputVariants({ variant, status, disabled }),
          rest.readOnly && "cursor-default bg-muted",
          classNames?.variant,
        ),
        affixWrapper: cn(
          hasAffix && inputSizeVariants({ size: mergedSize }),
          rest.readOnly && "cursor-default bg-muted",
          classNames?.affixWrapper,
        ),
      }}
    >
      {getInputElement()}
    </BaseInput>
  );
};

export { Input };
export type { InputProperties as InputProps };
