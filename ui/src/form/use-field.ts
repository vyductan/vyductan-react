import * as React from "react";

import { FormFieldContext, useFormContext } from "./context";

const useField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  // if (!fieldContext) {
  //   throw new Error("useFormField should be used within <FormField>");
  // }

  return {
    ...fieldContext,
    ...fieldState,
  };
};

export { useField };
