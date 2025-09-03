import React, { Children, isValidElement } from "react";
import { cn } from "@/lib/utils";

import {
  FormControl as ShadFormControl,
  useFormField,
} from "@acme/ui/shadcn/form";

import type { GenericSlotProps } from "../../slot";
import { Autocomplete } from "../../autocomplete";
import { DatePicker } from "../../date-picker";
import { Select } from "../../select";
import { GenericSlot } from "../../slot";
import { TimePicker } from "../../time-picker";

// import { useFormField } from "../hooks/use-form-field";

const FormControl = ({ className, ...props }: GenericSlotProps) => {
  const { error } = useFormField();

  return (
    <GenericSlot status={error ? "error" : "default"}>
      <ShadFormControl
        className={cn(
          Children.toArray(props.children).some(
            (child) =>
              isValidElement(child) &&
              (child.type === DatePicker ||
                child.type === TimePicker ||
                child.type === Select ||
                child.type === Autocomplete),
          )
            ? "w-full"
            : "",

          className,
        )}
        {...props}
      />
    </GenericSlot>
  );
};

export { FormControl };
