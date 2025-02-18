import React from "react";

import type { GenericSlotProps } from "../../slot";
import { GenericSlot } from "../../slot";
import { useFormField } from "../hooks/use-form-field";

const FormControl = ({ ...props }: GenericSlotProps) => {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <GenericSlot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        error ? `${formDescriptionId} ${formMessageId}` : `${formDescriptionId}`
      }
      aria-invalid={!!error}
      status={error ? "error" : "default"}
      {...props}
    />
  );
};

export { FormControl };
