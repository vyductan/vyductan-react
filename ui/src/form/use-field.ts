import * as React from "react";

import { FormFieldContext, FormItemContext, useFormContext } from "./context";

const useField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const form = useFormContext();

  if (!form) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const fieldState = form.getFieldState(fieldContext.name, form.formState);

  const { id } = itemContext;

  return {
    // ...fieldContext,
    name: fieldContext.name,
    fieldId: `${id}-form-item`,
    fieldDescriptionId: `${id}-form-item-description`,
    fieldMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

export { useField, useField as useFormField };
