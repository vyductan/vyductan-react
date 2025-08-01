import React from "react";
import { cn } from "@/lib/utils";

import {
  FormControl as ShadFormControl,
  useFormField,
} from "@acme/ui/shadcn/form";

import type { GenericSlotProps } from "../../slot";
import { GenericSlot } from "../../slot";

// import { useFormField } from "../hooks/use-form-field";

const FormControl = ({ className, ...props }: GenericSlotProps) => {
  const { error } = useFormField();

  return (
    <GenericSlot status={error ? "error" : "default"}>
      <ShadFormControl className={cn("w-full", className)} {...props} />
    </GenericSlot>
  );
};

export { FormControl };
