import React from "react";
import { useMergedState } from "@rc-component/util";
import { format as formatDate, isValid, parse } from "date-fns";

import { cn } from "@acme/ui/lib/utils";

import type { InputProps, InputRef } from "../input";
import { Icon } from "../../icons";
import { Input } from "../input";
import { Popover } from "../popover";
import { TimeSelect } from "./_components/time-select";

type DateType = Date | null | undefined;

type TimePickerProps = Omit<InputProps, "onChange" | "onSelect"> & {
  ref?: React.Ref<InputRef>;
  id?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  format?: string;
  showNow?: boolean;
  defaultValue?: DateType;
  value?: DateType;
  onChange?: (time: DateType) => void;
};
const TimePicker = (props: TimePickerProps) => {
  const {
    id: inputId,
    open: openProp,
    onOpenChange,
    className,
    placeholder = "Select time",
    format = "HH:mm",
    defaultValue = null,
    value,
    onChange,
    ...inputProps
  } = props;

  const [open, setOpen] = useMergedState(false, {
    value: openProp,
    onChange: onOpenChange,
  });

  // ====================== Value =======================
  const [localValue, setLocalValue] = useMergedState<DateType>(defaultValue, {
    value,
  });

  // Format the date for display
  const formatDateValue = (date: DateType): string => {
    if (!date || !isValid(date)) return "";
    return formatDate(date, format);
  };

  const handleChange = (newValue: DateType) => {
    setLocalValue(newValue);
    onChange?.(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) {
      handleChange(null);
      return;
    }

    try {
      const parsedDate = parse(value, format, new Date());
      if (isValid(parsedDate)) {
        handleChange(parsedDate);
      }
    } catch {
      // Invalid date format, keep the input but don't update the value
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
          <div className="flex">
            <TimeSelect
              value={localValue ?? undefined}
              format={format}
              onChange={(value) => {
                handleChange(value);
                setOpen(false);
              }}
            />
          </div>
        }
      >
        <div>
          <Input
            id={inputId}
            autoComplete="off"
            value={formatDateValue(localValue)}
            onChange={handleInputChange}
            placeholder={placeholder}
            {...inputProps}
            className={cn("w-[120px]", className)}
            suffix={
              <Icon
                icon="icon-[lucide--clock]"
                className="text-muted-foreground h-4 w-4"
              />
            }
            onClick={() => {
              if (!open) setOpen(true);
            }}
            onKeyUp={(event) => {
              event.stopPropagation();
              if (event.key === "Enter" || event.key === "Escape") {
                setOpen(false);
              }
            }}
          />
        </div>
      </Popover>
    </>
  );
};

export { TimePicker };
