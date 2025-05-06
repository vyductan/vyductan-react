"use client";

// https://github.com/react-component/input-number/commit/d9662d5831f6a9d5bda90e39742b75d5f7eb0c9c
// Jan 28, 2025
import type { DecimalClass, ValueType } from "@rc-component/mini-decimal";
import React, { useCallback, useState } from "react";
import getMiniDecimal, {
  getNumberPrecision,
  num2str,
  toFixed,
  validateNumber,
} from "@rc-component/mini-decimal";
import { useLayoutUpdateEffect } from "@rc-component/util/lib/hooks/useLayoutEffect";
import proxyObject from "@rc-component/util/lib/proxyObject";
import { composeRef } from "@rc-component/util/lib/ref";

import { cn } from "@acme/ui/lib/utils";

import type { BaseInputProps } from "../types";
import type { InputFocusOptions } from "../utils/common-utils";
import type { HolderRef } from "./base-input";
import useCursor from "../hooks/use-cursor";
import useFrame from "../hooks/use-frame";
import { triggerFocus } from "../utils/common-utils";
import { getDecupleSteps } from "../utils/number-util";
import { BaseInput } from "./base-input";
import StepHandler from "./step-handler";

export interface InputNumberRef extends HTMLInputElement {
  focus: (options?: InputFocusOptions) => void;
  blur: () => void;
  nativeElement: HTMLElement;
}

/**
 * We support `stringMode` which need handle correct type when user call in onChange
 * format max or min value
 * 1. if isInvalid return null
 * 2. if precision is undefined, return decimal
 * 3. format with precision
 *    I. if max > 0, round down with precision. Example: max= 3.5, precision=0  afterFormat: 3
 *    II. if max < 0, round up with precision. Example: max= -3.5, precision=0  afterFormat: -4
 *    III. if min > 0, round up with precision. Example: min= 3.5, precision=0  afterFormat: 4
 *    IV. if min < 0, round down with precision. Example: max= -3.5, precision=0  afterFormat: -3
 */
const getDecimalValue = (stringMode: boolean, decimalValue: DecimalClass) => {
  if (stringMode || decimalValue.isEmpty()) {
    return decimalValue.toString();
  }

  return decimalValue.toNumber();
};

const getDecimalIfValidate = (value: ValueType) => {
  const decimal = getMiniDecimal(value);
  return decimal.isInvalidate() ? null : decimal;
};

type InputNumberProps<T extends ValueType = ValueType> = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onInput" | "onChange" | "prefix" | "suffix"
> & {
  ref?: React.ForwardedRef<HTMLInputElement>;

  /** value will show as string */
  stringMode?: boolean;

  defaultValue?: T;
  value?: T | null;

  onInput?: (text: string) => void;
  onChange?: (value: T | null) => void;
  onPressEnter?: React.KeyboardEventHandler<HTMLInputElement>;

  /** Parse display value to validate number */
  parser?: (displayValue: string | undefined) => T;
  /** Transform `value` to display value show in input */
  formatter?: (
    value: T | undefined,
    info: { userTyping: boolean; input: string },
  ) => string;
  /** Syntactic sugar of `formatter`. Config precision of display. */
  precision?: number;
  /** Syntactic sugar of `formatter`. Config decimal separator of display. */
  decimalSeparator?: string;

  min?: T;
  max?: T;
  step?: ValueType;
  onStep?: (
    value: T,
    info: {
      offset: ValueType;
      type: "up" | "down";
      emitter: "handler" | "keyboard" | "wheel";
    },
  ) => void;

  /**
   * Trigger change onBlur event.
   * If disabled, user must press enter or click handler to confirm the value update
   */
  changeOnBlur?: boolean;

  // Customize handler node
  upHandler?: React.ReactNode;
  downHandler?: React.ReactNode;
  keyboard?: boolean;
  changeOnWheel?: boolean;

  classNames?: BaseInputProps["classNames"] & {
    input?: string;
  };
  controls?: boolean;

  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  addonBefore?: React.ReactNode;
  addonAfter?: React.ReactNode;
};

type InternalInputNumberProps = Omit<InputNumberProps, "prefix" | "suffix"> & {
  ref: React.Ref<HTMLInputElement>;
  domRef: React.Ref<HTMLDivElement>;
};

const InternalInputNumber = ({
  ref,
  className,
  style,
  min,
  max,
  step = 1,
  defaultValue,
  value,
  disabled,
  readOnly,
  upHandler,
  downHandler,
  keyboard,
  changeOnWheel = false,
  controls = true,

  classNames,
  stringMode = false,

  parser,
  formatter,
  precision,
  decimalSeparator,

  onChange,
  onInput,
  onPressEnter,
  onStep,

  changeOnBlur = true,

  domRef,

  ...inputProps
}: InternalInputNumberProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [focus, setFocus] = React.useState(false);

  const userTypingRef = React.useRef(false);
  const compositionRef = React.useRef(false);
  const shiftKeyRef = React.useRef(false);

  // ============================ Value =============================
  // Real value control
  const [decimalValue, setDecimalValue] = React.useState<DecimalClass>(() =>
    getMiniDecimal(value ?? defaultValue ?? ""),
  );

  function setUncontrolledDecimalValue(newDecimal: DecimalClass) {
    if (value === undefined) {
      setDecimalValue(newDecimal);
    }
  }

  // ====================== Parser & Formatter ======================
  /**
   * `precision` is used for formatter & onChange.
   * It will auto generate by `value` & `step`.
   * But it will not block user typing.
   *
   * Note: Auto generate `precision` is used for legacy logic.
   * We should remove this since we already support high precision with BigInt.
   *
   * @param number  Provide which number should calculate precision
   * @param userTyping  Change by user typing
   */
  const getPrecision = useCallback(
    (numberString: string, userTyping: boolean) => {
      if (userTyping) {
        return;
      }

      if (precision && precision >= 0) {
        return precision;
      }

      return Math.max(
        getNumberPrecision(numberString),
        getNumberPrecision(step),
      );
    },
    [precision, step],
  );
  // >>> Parser
  const mergedParser = React.useCallback(
    (num: string | number) => {
      const numStr = String(num);

      if (parser) {
        return parser(numStr);
      }

      let parsedString = numStr;
      if (decimalSeparator) {
        parsedString = parsedString.replace(decimalSeparator, ".");
      }

      // [Legacy] We still support auto convert `$ 123,456` to `123456`
      return parsedString.replaceAll(/[^\w.-]+/g, "");
    },
    [parser, decimalSeparator],
  );
  // >>> Formatter
  const inputValueRef = React.useRef<string | number>("");
  const mergedFormatter = React.useCallback(
    (number: string, userTyping: boolean) => {
      if (formatter) {
        return formatter(number, {
          userTyping,
          input: String(inputValueRef.current),
        });
      }

      let str = typeof number === "number" ? num2str(number) : number;

      // User typing will not auto format with precision directly
      if (!userTyping) {
        const mergedPrecision = getPrecision(str, userTyping);

        if (
          validateNumber(str) &&
          (decimalSeparator || mergedPrecision! >= 0)
        ) {
          // Separator
          const separatorString = decimalSeparator ?? ".";

          str = toFixed(str, separatorString, mergedPrecision);
        }
      }

      return str;
    },
    [formatter, getPrecision, decimalSeparator],
  );

  // ========================== InputValue ==========================
  /**
   * Input text value control
   *
   * User can not update input content directly. It updates with follow rules by priority:
   *  1. controlled `value` changed
   *    * [SPECIAL] Typing like `1.` should not immediately convert to `1`
   *  2. User typing with format (not precision)
   *  3. Blur or Enter trigger revalidate
   */
  const [inputValue, setInternalInputValue] = useState<string | number>(() => {
    const initValue = defaultValue ?? value ?? "";
    if (
      decimalValue.isInvalidate() &&
      ["string", "number"].includes(typeof initValue)
    ) {
      return Number.isNaN(initValue) ? "" : initValue;
    }
    return mergedFormatter(decimalValue.toString(), false);
  });
  inputValueRef.current = inputValue;

  // Should always be string
  function setInputValue(newValue: DecimalClass, userTyping: boolean) {
    setInternalInputValue(
      mergedFormatter(
        // Invalidate number is sometime passed by external control, we should let it go
        // Otherwise is controlled by internal interactive logic which check by userTyping
        // You can ref 'show limited value when input is not focused' test for more info.
        newValue.isInvalidate()
          ? newValue.toString(false)
          : newValue.toString(!userTyping),
        userTyping,
      ),
    );
  }

  // >>> Max & Min limit
  const maxDecimal = React.useMemo(
    () => getDecimalIfValidate(max ?? ""),
    // eslint-disable-next-line react-hooks/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [max, precision],
  );
  const minDecimal = React.useMemo(
    () => getDecimalIfValidate(min ?? ""),
    // eslint-disable-next-line react-hooks/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [min, precision],
  );

  const upDisabled = React.useMemo(() => {
    if (!maxDecimal || decimalValue.isInvalidate()) {
      return false;
    }

    return maxDecimal.lessEquals(decimalValue);
  }, [maxDecimal, decimalValue]);

  const downDisabled = React.useMemo(() => {
    if (!minDecimal || decimalValue.isInvalidate()) {
      return false;
    }

    return decimalValue.lessEquals(minDecimal);
  }, [minDecimal, decimalValue]);

  // Cursor controller
  const [recordCursor, restoreCursor] = useCursor(inputRef.current, focus);

  // ============================= Data =============================
  /**
   * Find target value closet within range.
   * e.g. [11, 28]:
   *    3  => 11
   *    23 => 23
   *    99 => 28
   */
  const getRangeValue = (target: DecimalClass) => {
    // target > max
    if (maxDecimal && !target.lessEquals(maxDecimal)) {
      return maxDecimal;
    }

    // target < min
    if (minDecimal && !minDecimal.lessEquals(target)) {
      return minDecimal;
    }

    return null;
  };

  /**
   * Check value is in [min, max] range
   */
  const isInRange = (target: DecimalClass) => !getRangeValue(target);

  /**
   * Trigger `onChange` if value validated and not equals of origin.
   * Return the value that re-align in range.
   */
  const triggerValueUpdate = (
    newValue: DecimalClass,
    userTyping: boolean,
  ): DecimalClass => {
    let updateValue = newValue;

    let isRangeValidate = isInRange(updateValue) || updateValue.isEmpty();

    // Skip align value when trigger value is empty.
    // We just trigger onChange(null)
    // This should not block user typing
    if (!updateValue.isEmpty() && !userTyping) {
      // Revert value in range if needed
      updateValue = getRangeValue(updateValue) ?? updateValue;
      isRangeValidate = true;
    }

    if (!readOnly && !disabled && isRangeValidate) {
      const numStr = updateValue.toString();
      const mergedPrecision = getPrecision(numStr, userTyping);
      if (mergedPrecision && mergedPrecision >= 0) {
        updateValue = getMiniDecimal(toFixed(numStr, ".", mergedPrecision));

        // When to fixed. The value may out of min & max range.
        // 4 in [0, 3.8] => 3.8 => 4 (toFixed)
        if (!isInRange(updateValue)) {
          updateValue = getMiniDecimal(
            toFixed(numStr, ".", mergedPrecision, true),
          );
        }
      }

      // Trigger event
      if (!updateValue.equals(decimalValue)) {
        setUncontrolledDecimalValue(updateValue);
        onChange?.(
          updateValue.isEmpty()
            ? null
            : getDecimalValue(stringMode, updateValue),
        );

        // Reformat input if value is not controlled
        if (value === undefined) {
          setInputValue(updateValue, userTyping);
        }
      }

      return updateValue;
    }

    return decimalValue;
  };

  // ========================== User Input ==========================
  const onNextPromise = useFrame();

  // >>> Collect input value
  const collectInputValue = (inputString: string) => {
    recordCursor();

    // Update inputValue in case input can not parse as number
    // Refresh ref value immediately since it may used by formatter
    inputValueRef.current = inputString;
    setInternalInputValue(inputString);

    // Parse number
    if (!compositionRef.current) {
      const finalValue = mergedParser(inputString);
      const finalDecimal = getMiniDecimal(finalValue);
      if (!finalDecimal.isNaN()) {
        triggerValueUpdate(finalDecimal, true);
      }
    }

    // Trigger onInput later to let user customize value if they want to handle something after onChange
    onInput?.(inputString);

    // optimize for chinese input experience
    // https://github.com/ant-design/ant-design/issues/8196
    onNextPromise(() => {
      let nextInputString = inputString;
      if (!parser) {
        nextInputString = inputString.replaceAll("。", ".");
      }

      if (nextInputString !== inputString) {
        collectInputValue(nextInputString);
      }
    });
  };

  // >>> Composition
  const onCompositionStart = () => {
    compositionRef.current = true;
  };

  const onCompositionEnd = () => {
    compositionRef.current = false;

    collectInputValue(inputRef.current!.value);
  };

  // >>> Input
  const onInternalInput: React.ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    collectInputValue(event.target.value);
  };

  // ============================= Step =============================
  const onInternalStep = (
    up: boolean,
    emitter: "handler" | "keyboard" | "wheel",
  ) => {
    // Ignore step since out of range
    if ((up && upDisabled) || (!up && downDisabled)) {
      return;
    }

    // Clear typing status since it may be caused by up & down key.
    // We should sync with input value.
    userTypingRef.current = false;

    let stepDecimal = getMiniDecimal(
      shiftKeyRef.current ? getDecupleSteps(step) : step,
    );
    if (!up) {
      stepDecimal = stepDecimal.negate();
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const target = (decimalValue || getMiniDecimal(0)).add(
      stepDecimal.toString(),
    );

    const updatedValue = triggerValueUpdate(target, false);
    onStep?.(getDecimalValue(stringMode, updatedValue), {
      offset: shiftKeyRef.current ? getDecupleSteps(step) : step,
      type: up ? "up" : "down",
      emitter,
    });

    inputRef.current?.focus();
  };

  // ============================ Flush =============================
  /**
   * Flush current input content to trigger value change & re-formatter input if needed.
   * This will always flush input value for update.
   * If it's invalidate, will fallback to last validate value.
   */
  const flushInputValue = (userTyping: boolean) => {
    const parsedValue = getMiniDecimal(mergedParser(inputValue));
    const formatValue: DecimalClass = parsedValue.isNaN()
      ? triggerValueUpdate(decimalValue, userTyping)
      : // Only validate value or empty value can be re-fill to inputValue
        // Reassign the formatValue within ranged of trigger control
        triggerValueUpdate(parsedValue, userTyping);

    if (value !== undefined) {
      // Reset back with controlled value first
      setInputValue(decimalValue, false);
    } else if (!formatValue.isNaN()) {
      // Reset input back since no validate value
      setInputValue(formatValue, false);
    }
  };

  // Solve the issue of the event triggering sequence when entering numbers in chinese input (Safari)
  const onBeforeInput = () => {
    userTypingRef.current = true;
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    const { key, shiftKey } = event;
    userTypingRef.current = true;

    shiftKeyRef.current = shiftKey;

    if (key === "Enter") {
      if (!compositionRef.current) {
        userTypingRef.current = false;
      }
      flushInputValue(false);
      onPressEnter?.(event);
    }

    if (keyboard === false) {
      return;
    }

    // Do step
    if (
      !compositionRef.current &&
      ["Up", "ArrowUp", "Down", "ArrowDown"].includes(key)
    ) {
      onInternalStep(key === "Up" || key === "ArrowUp", "keyboard");
      event.preventDefault();
    }
  };

  const onKeyUp = () => {
    userTypingRef.current = false;
    shiftKeyRef.current = false;
  };

  React.useEffect(() => {
    if (changeOnWheel && focus) {
      const onWheel = (event: WheelEvent) => {
        // moving mouse wheel rises wheel event with deltaY < 0
        // scroll value grows from top to bottom, as screen Y coordinate
        onInternalStep(event.deltaY < 0, "wheel");
        event.preventDefault();
      };
      const input = inputRef.current;
      if (input) {
        // React onWheel is passive and we can't preventDefault() in it.
        // That's why we should subscribe with DOM listener
        // https://stackoverflow.com/questions/63663025/react-onwheel-handler-cant-preventdefault-because-its-a-passive-event-listenev
        input.addEventListener("wheel", onWheel, { passive: false });
        return () => input.removeEventListener("wheel", onWheel);
      }
    }
  });

  // >>> Focus & Blur
  const onBlur = () => {
    if (changeOnBlur) {
      flushInputValue(false);
    }

    setFocus(false);

    userTypingRef.current = false;
  };

  // ========================== Controlled ==========================
  // Input by precision & formatter
  useLayoutUpdateEffect(() => {
    if (!decimalValue.isInvalidate()) {
      setInputValue(decimalValue, false);
    }
  }, [precision, formatter]);

  // Input by value
  useLayoutUpdateEffect(() => {
    const newValue = getMiniDecimal(value ?? "");
    setDecimalValue(newValue);

    const currentParsedValue = getMiniDecimal(mergedParser(inputValue));

    // When user typing from `1.2` to `1.`, we should not convert to `1` immediately.
    // But let it go if user set `formatter`
    if (
      !newValue.equals(currentParsedValue) ||
      !userTypingRef.current ||
      formatter
    ) {
      // Update value as effect
      setInputValue(newValue, userTypingRef.current);
    }
  }, [value]);

  // ============================ Cursor ============================
  useLayoutUpdateEffect(() => {
    if (formatter) {
      restoreCursor();
    }
  }, [inputValue]);

  // ============================ Render ============================
  return (
    <div
      ref={domRef}
      className={cn("group", className)}
      style={style}
      onFocus={() => {
        setFocus(true);
      }}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onCompositionStart={onCompositionStart}
      onCompositionEnd={onCompositionEnd}
      onBeforeInput={onBeforeInput}
    >
      {/* <div className={cn("")}>
<input 
autoComplete="off"
role="spinbutton"
aria-valuemin={min as any}
aria-valuemax={max as any}
aria-valuenow={decimalValue.isInvalidate() ? null : (decimalValue.toString() as any)}
step={step}
{...inputProps}
ref={composeRef(inputRef, ref)}
className={inputClassName}
value={inputValue}
onChange={onInternalInput}
disabled={disabled}
readOnly={readOnly}
/>
      </div> */}
      <input
        // ref={ref}
        // type="number"
        // onChange={(e) => {
        //   return onChange?.(Number(e.target.value));
        // }}
        autoComplete="off"
        role="spinbutton"
        aria-valuemin={min as any}
        aria-valuemax={max as any}
        aria-valuenow={
          decimalValue.isInvalidate()
            ? undefined
            : (decimalValue.toString() as any)
        }
        step={step}
        {...inputProps}
        // onBlur={onInternalBlur}
        // onKeyDown={onKeyDown}
        // onKeyUp={onKeyUp}
        // onCompositionStart={onCompositionStart}
        // onCompositionEnd={onCompositionEnd}
        // onBeforeInput={onBeforeInput}

        ref={ref ? composeRef(ref, inputRef) : inputRef}
        value={inputValue}
        onChange={onInternalInput}
        disabled={disabled}
        readOnly={readOnly}
        // className={inputClassName}
        className={classNames?.input}
      />
      {controls && (
        <StepHandler
          upNode={upHandler}
          downNode={downHandler}
          upDisabled={upDisabled}
          downDisabled={downDisabled}
          onStep={onInternalStep}
        />
      )}
    </div>
  );
};

const InputNumber = ((props: InputNumberProps) => {
  const {
    ref,
    disabled,
    style,
    value,
    prefix,
    suffix,
    addonBefore,
    addonAfter,
    className,
    classNames,
    ...rest
  } = props;

  const holderRef = React.useRef<HolderRef>(null);
  const inputNumberDomRef = React.useRef<HTMLDivElement>(null);
  const inputFocusRef = React.useRef<HTMLInputElement>(null);

  const focus = (option?: InputFocusOptions) => {
    if (inputFocusRef.current) {
      triggerFocus(inputFocusRef.current, option);
    }
  };

  React.useImperativeHandle(ref, () =>
    proxyObject(inputFocusRef.current!, {
      focus,
      nativeElement:
        holderRef.current?.nativeElement ?? inputNumberDomRef.current,
    }),
  );

  return (
    <BaseInput
      className={className}
      triggerFocus={focus}
      value={value}
      disabled={disabled}
      style={style}
      prefix={prefix}
      suffix={suffix}
      addonAfter={addonAfter}
      addonBefore={addonBefore}
      classNames={classNames}
      components={{
        affixWrapper: "div",
        groupWrapper: "div",
        wrapper: "div",
        groupAddon: "div",
      }}
      ref={holderRef}
    >
      <InternalInputNumber
        disabled={disabled}
        ref={inputFocusRef}
        domRef={inputNumberDomRef}
        // className={classNames?.input}
        classNames={{
          input: classNames?.input,
        }}
        {...rest}
      />
    </BaseInput>
  );
}) as <T extends ValueType = ValueType>(
  props: React.PropsWithChildren<InputNumberProps<T>> & {
    ref?: React.Ref<HTMLInputElement>;
  },
) => React.ReactElement;
export { InputNumber };
export type { InputNumberProps };

export { type ValueType } from "@rc-component/mini-decimal";
