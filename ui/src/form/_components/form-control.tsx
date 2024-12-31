import React from "react";

import type { GenericSlotProps } from "../../slot";
import { GenericSlot } from "../../slot";
import { useFormField } from "../use-field";

const FormControl = ({ ...props }: GenericSlotProps) => {
  const {
    error,
    fieldId,
    fieldDescriptionId: formDescriptionId,
    fieldMessageId: formMessageId,
  } = useFormField();

  return (
    <GenericSlot
      id={fieldId}
      aria-describedby={
        error ? `${formDescriptionId} ${formMessageId}` : `${formDescriptionId}`
      }
      aria-invalid={!!error}
      status={error ? "error" : "default"}
      {...props}
    />
  );
};
FormControl.displayName = "FormControl";

export { FormControl };
