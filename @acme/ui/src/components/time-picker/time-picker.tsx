import type { Dayjs } from "dayjs";
import React from "react";
import { useMergedState } from "@rc-component/util";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import { cn } from "@acme/ui/lib/utils";

import type { PickerRef as PickerReference } from "../date-picker/types";
import type {
  InputProps as InputProperties,
  InputRef as InputReference,
} from "../input";
import { Icon } from "../../icons";
import { Input } from "../input";
import { Popover } from "../popover";
import { TimeSelect } from "./_components/time-select";

dayjs.extend(customParseFormat);

export type DateType = Dayjs | null | undefined;

type TimePickerProperties<
  TValue extends Dayjs | string | null | undefined = Dayjs,
> = Omit<
  React.ComponentProps<"div">,
  "onBlur" | "onChange" | "defaultValue" | "ref"
> &
  Pick<
    InputProperties,
    "name" | "size" | "disabled" | "status" | "placeholder" | "onBlur"
  > & {
    ref?: React.Ref<PickerReference>;
    id?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    format?: string;
    showNow?: boolean;
    defaultValue?: TValue;
    value?: TValue;
    onChange?: (time: TValue, timeString: string | undefined) => void;
  };
const TimePicker = <TValue extends Dayjs | string | null | undefined = Dayjs>(
  properties: TimePickerProperties<TValue>,
) => {
  const {
    id: inputId,
    open: openProperty,
    onOpenChange,
    className,

    // picker props
    format = "HH:mm:ss",
    defaultValue = null,
    value,
    onChange,

    // input props
    ref,
    name,
    placeholder = "Select time",
    size,
    status,
    disabled,
    onBlur,
    "aria-invalid": ariaInvalid,
    "aria-describedby": ariaDescribedBy,

    // trigger props
    ...restProperties
  } = properties;
  const [open, setOpen] = useMergedState(false, {
    value: openProperty,
    onChange: onOpenChange,
  });

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen);
    },
    [setOpen],
  );

  // ====================== Value =======================
  const [localValue, setLocalValue] = useMergedState<TValue>(
    defaultValue as TValue,
    {
      value: value as TValue,
      onChange: (newValue) => {
        onChange?.(newValue, formatDateValue(newValue, format));
      },
    },
  );

  const [inputDraft, setInputDraft] = React.useState<{
    format: string;
    text: string;
    value: TValue;
  }>();
  const [isInputFocused, setIsInputFocused] = React.useState(false);
  const [hoverPreview, setHoverPreview] = React.useState<DateType>(null);

  const parsedLocalStringValue =
    typeof localValue === "string" ? parseDateValue(localValue, format) : null;
  const committedInputValue =
    typeof localValue === "string" && !parsedLocalStringValue
      ? localValue
      : formatDateValue(parsedLocalStringValue ?? localValue, format);
  const inputValue =
    inputDraft?.format === format && Object.is(inputDraft.value, localValue)
      ? inputDraft.text
      : committedInputValue;

  const handleChange = React.useCallback(
    (newValue: DateType) => {
      setInputDraft(undefined);
      setLocalValue(newValue as TValue);
    },
    [setLocalValue],
  );

  // ========================= Refs =========================
  const rootReference = React.useRef<HTMLDivElement>(null);
  const inputReference = React.useRef<InputReference>(null);
  React.useImperativeHandle(ref, () => ({
    nativeElement: rootReference.current!,
    focus: (options) => {
      inputReference.current?.focus(options);
    },
    blur: () => {
      inputReference.current?.blur();
    },
    select: () => inputReference.current?.select(),
    setCustomValidity: (message) =>
      inputReference.current?.setCustomValidity(message),
    reportValidity: () => inputReference.current?.reportValidity(),
  }));

  // const inputRef = React.useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    // Typing should override hover preview text.
    setHoverPreview(null);
    setInputDraft({ format, text: rawValue, value: localValue });

    if (!rawValue) {
      handleChange(null);
      return;
    }

    const parsedDate = parseDateValue(rawValue, format, {
      strictFormatOnly: true,
    });

    if (parsedDate) {
      handleChange(parsedDate);
    }
  };

  const handleHoverChange = React.useCallback((value: DateType) => {
    setHoverPreview(value);
  }, []);

  const handleOk = React.useCallback(() => {
    handleOpenChange(false);
  }, [handleOpenChange]);

  const handleNow = React.useCallback(() => {
    const now = dayjs();
    handleChange(now);
    handleOk();
  }, [handleChange, handleOk]);

  const timeSelectContent = React.useMemo(() => {
    // Convert string to DateType if needed
    const dateValue: DateType =
      typeof localValue === "string"
        ? parseDateValue(localValue, format)
        : (localValue as DateType);

    return (
      <div className="flex flex-col">
        <TimeSelect
          value={dateValue}
          format={format}
          onChange={handleChange}
          onHoverChange={handleHoverChange}
          onOk={handleOk}
          onNow={handleNow}
        />
      </div>
    );
  }, [
    localValue,
    format,
    handleChange,
    handleHoverChange,
    handleOk,
    handleNow,
  ]);

  return (
    <>
      <Popover
        open={open}
        className="w-auto p-0"
        trigger="click"
        placement="bottomLeft"
        onInteractOutside={(event) => {
          if (
            event.target &&
            "id" in event.target &&
            event.target.id !== inputId
          ) {
            handleOpenChange(false);
          }
        }}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
        content={timeSelectContent}
      >
        <div
          ref={rootReference}
          onClick={(e) => {
            e.stopPropagation();
            if (!open) handleOpenChange(true);
          }}
          {...restProperties}
          data-slot="time-picker"
          className={cn("inline-flex", "w-[120px]", className)}
        >
          <Input
            ref={inputReference}
            type="text"
            id={inputId}
            name={name}
            autoComplete="off"
            value={
              !isInputFocused && open && hoverPreview
                ? formatDateValue(hoverPreview, format)
                : inputValue
            }
            onChange={handleInputChange}
            classNames={{
              input: cn(
                open &&
                  hoverPreview &&
                  localValue &&
                  typeof localValue !== "string" &&
                  !localValue.isSame(hoverPreview, "minute") &&
                  "text-muted-foreground",
              ),
            }}
            onFocus={(e) => {
              setIsInputFocused(true);
              // Select all text on focus for better UX
              e.target.select();
            }}
            // onClick={(e) => {
            //   // Prevent event bubbling to avoid closing the popover
            //   e.stopPropagation();
            //   if (!open) setOpen(true);
            // }}
            placeholder={placeholder}
            size={size}
            disabled={disabled}
            status={status}
            className={cn(
              // Hide native time picker icon
              "[&>input::-webkit-calendar-picker-indicator]:hidden [&>input::-webkit-inner-spin-button]:hidden [&>input::-webkit-outer-spin-button]:hidden",
            )}
            suffix={
              <Icon
                icon="icon-[lucide--clock]"
                className="text-muted-foreground h-4 w-4"
              />
            }
            onKeyUp={(event) => {
              event.stopPropagation();
              if (event.key === "Enter" || event.key === "Escape") {
                handleOpenChange(false);
              }
            }}
            onBlur={onBlur}
            onBlurCapture={() => {
              setIsInputFocused(false);
            }}
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
          />
        </div>
      </Popover>
    </>
  );
};

export { TimePicker };
export type { TimePickerProperties as TimePickerProps };

const parseDateValue = (
  value: Dayjs | string | null | undefined,
  format: string,
  options?: {
    strictFormatOnly?: boolean;
  },
): Dayjs | null => {
  if (!value) {
    return null;
  }

  if (typeof value === "object" && "isValid" in value) {
    return value.isValid() ? value : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();
  if (!normalizedValue) {
    return null;
  }

  const knownFormats = options?.strictFormatOnly
    ? [format]
    : [...new Set([format, "HH:mm:ss", "HH:mm", "H:m:s", "H:m"])];

  for (const knownFormat of knownFormats) {
    const parsed = dayjs(normalizedValue, knownFormat, true);
    if (parsed.isValid()) {
      return parsed;
    }
  }

  return null;
};

// Format time value for display
const formatDateValue = (
  date: Dayjs | string | null | undefined,
  format: string,
): string => {
  const parsed = parseDateValue(date, format);
  if (parsed) {
    return parsed.format(format);
  }

  return "";
};
