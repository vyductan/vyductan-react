import React from "react";

import { FormControl as ShadFormControl } from "@acme/ui/shadcn/form";

import type { GenericSlotProps } from "../../slot";
import { GenericSlot } from "../../slot";
import { useFormField } from "../hooks/use-form-field";

const FormControl = ({ ...props }: GenericSlotProps) => {
  const { error } = useFormField();

  return (
    <GenericSlot status={error ? "error" : "default"} {...props}>
      <ShadFormControl {...props} />
    </GenericSlot>
  );
};

export { FormControl };
