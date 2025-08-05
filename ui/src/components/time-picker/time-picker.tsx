import type { Dayjs } from "dayjs";
import React from "react";
import { useMergedState } from "@rc-component/util";
import dayjs from "dayjs";

import { cn } from "@acme/ui/lib/utils";

import type { PickerRef } from "../date-picker/types";
import type { InputProps, InputRef } from "../input";
import { Icon } from "../../icons";
import { Button } from "../button";
import { Input } from "../input";
import { Popover } from "../popover";
import { TimeSelect } from "./_components/time-select";

export type DateType = Dayjs | null | undefined;

type TimePickerProps = Omit<
  React.ComponentProps<"div">,
  "onBlur" | "onChange"
> &
  Pick<
    InputProps,
    "name" | "size" | "disabled" | "status" | "placeholder" | "onBlur"
  > & {
    ref?: React.Ref<PickerRef>;
    id?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    format?: string;
    showNow?: boolean;
    defaultValue?: DateType;
    value?: DateType;
    onChange?: (time: DateType, timeString: string | undefined) => void;
  };
const TimePicker = (props: TimePickerProps) => {
  const {
    id: inputId,
    open: openProp,
    onOpenChange,
    className,

    // picker props
    format = "HH:mm",
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
    ...restProps
  } = props;

  const [open, setOpen] = useMergedState(false, {
    value: openProp,
    onChange: onOpenChange,
  });

  // ====================== Value =======================
  const [localValue, setLocalValue] = useMergedState<DateType>(defaultValue, {
    value,
  });

  // console.log("lllll", localValue, restProps);
  // Track input display value separately from parsed value
  const [inputValue, setInputValue] = React.useState(() =>
    formatDateValue(localValue, format),
  );

  // Update input value when localValue changes externally
  React.useEffect(() => {
    setInputValue(formatDateValue(localValue, format));
  }, [localValue, format]);

  const handleChange = (newValue: DateType) => {
    setLocalValue(newValue);
    onChange?.(newValue, formatDateValue(newValue, format));
  };

  // ========================= Refs =========================
  const rootRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<InputRef>(null);
  React.useImperativeHandle(ref, () => ({
    nativeElement: rootRef.current!,
    focus: (options) => {
      inputRef.current?.focus(options);
    },
    blur: () => {
      inputRef.current?.blur();
    },
    select: () => inputRef.current?.select(),
    setCustomValidity: (msg) => inputRef.current?.setCustomValidity(msg),
    reportValidity: () => inputRef.current?.reportValidity(),
  }));

  // const inputRef = React.useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    setInputValue(rawValue);

    if (!rawValue) {
      handleChange(null);
      return;
    }

    // Parse the native time input value (HH:MM format)
    // Use today's date as base and set the time
    const today = dayjs().format("YYYY-MM-DD");
    const parsedDate = dayjs(`${today} ${rawValue}`, `YYYY-MM-DD ${format}`);

    if (parsedDate.isValid()) {
      handleChange(parsedDate);
    }
  };

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
            setOpen(false);
          }
        }}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
        content={
          <div className="flex flex-col">
            <TimeSelect
              value={localValue}
              format={format}
              onChange={(value) => {
                handleChange(value);
                // setOpen(false);
              }}
              onOk={() => setOpen(false)}
            />
          </div>
        }
      >
        <div
          ref={rootRef}
          onClick={(e) => {
            e.stopPropagation();
            if (!open) setOpen(true);
          }}
          {...restProps}
          data-slot="time-picker"
          className={cn("inline-flex", "w-[120px]", className)}
        >
          <Input
            ref={inputRef}
            type="time"
            id={inputId}
            name={name}
            autoComplete="off"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={(e) => {
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
                setOpen(false);
              }
            }}
            onBlur={onBlur}
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
          />
        </div>
      </Popover>
    </>
  );
};

export { TimePicker };

// Format the date for display
const formatDateValue = (date: DateType, format: string): string => {
  if (!date?.isValid()) return "";
  return date.format(format);
};
