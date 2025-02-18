import * as React from "react";

import { FormFieldContext, FormItemContext, useFormContext } from "../context";

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const form = useFormContext();

  if (!form) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const fieldState = form.getFieldState(fieldContext.name, form.formState);

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

export { useFormField };
