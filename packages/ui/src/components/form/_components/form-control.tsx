import { Children, isValidElement } from "react";

import { cn } from "@acme/ui/lib/utils";
import {
  FormControl as ShadFormControl,
  useFormField,
} from "@acme/ui/shadcn/form";

import type { GenericSlotProps } from "../../slot";
import { AutoComplete } from "../../auto-complete";
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
                child.type === AutoComplete),
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
