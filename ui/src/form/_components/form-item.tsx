import React from "react";

import { cn } from "../..";
import { FormItemContext } from "../context";

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn(
          "grid gap-2",
          // old
          // "space-y-2"
          className,
        )}
        {...props}
      />
    </FormItemContext.Provider>
  );
}

export { FormItem };
