import * as React from "react";

import { FormFieldContext, useFormContext } from "./context";

const useField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const form = useFormContext();

  if (!form) {
    throw new Error("useFormContext should be used within <Form>");
  }

  const fieldState = form.getFieldState(fieldContext.name, form.formState);

  // if (!fieldContext) {
  //   throw new Error("useFormField should be used within <FormField>");
  // }

  return {
    ...fieldContext,
    ...fieldState,
  };
};

export { useField };
