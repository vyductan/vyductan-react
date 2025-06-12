import React, { useEffect, useRef } from "react";
import { useComposeRef } from "@rc-component/util";

import { cn } from "@acme/ui/lib/utils";
import { FormItem as ShadFormItem } from "@acme/ui/shadcn/form";

function FormItem({
  ref: __ref,
  className,
  layout,
  children,
  ...props
}: React.ComponentProps<typeof ShadFormItem> & {
  layout?: "horizontal" | "vertical";
  error?: string;
}) {
  const internalRef = useRef<HTMLDivElement>(null);
  const composedRef = useComposeRef<HTMLDivElement | null>(
    internalRef,
    ...(__ref ? [__ref] : []),
  );
  // get child id (from shadcn FormItem id)
  // const id = internalRef.current?.id;

  // const [hasFormMessage, setHasFormMessage] = React.useState(false);
  // useEffect(() => {
  //   const formMessageElement = document.querySelector(
  //     CSS.escape(`#${id}-form-item-message`),
  //   );
  //   if (formMessageElement) {
  //     setHasFormMessage(true);
  //   }
  // }, [children, id]);
  // const targetElement = composedRef?.current?.querySelector(
  //   '[data-slot="form-message"]',
  // );
  // console.log("rrrrrr", composedRef, targetElement);

  const [hasFormMessage, setHasFormMessage] = React.useState(false);
  useEffect(() => {
    setHasFormMessage(
      !!(
        composedRef &&
        "current" in composedRef &&
        composedRef.current?.querySelector('[data-slot="form-message"]')
      ),
    );
  }, [children, composedRef]);
  // const hasFormMessage =

  return (
    <ShadFormItem
      className={cn(
        "flex", // to set form-item-control height fit with content
        layout === "horizontal" ? "flex-row" : "flex-col",
        // hasFormMessage ? "" : "mb-6",
        "mb-6",
        className,
      )}
      ref={composedRef}
      {...props}
    >
      {/* {String(hasFormMessage)} */}
      {children}
      {hasFormMessage && <div className="-mb-6" />}
    </ShadFormItem>
  );
  // return (
  //   <FormItemContext.Provider value={{ id }}>
  //     <ShadFormItem
  //       className={cn(
  //         "flex", // to set form-item-control height fit with content
  //         layout === "horizontal" ? "flex-row" : "flex-col",
  //         // hasFormMessage ? "" : "mb-6",
  //         "mb-6",
  //         className,
  //       )}
  //       ref={ref}
  //       {...props}
  //     >
  //       {children}
  //       {hasFormMessage && <div className="-mb-6" />}
  //     </ShadFormItem>
  //   </FormItemContext.Provider>
  // );
}

export { FormItem };
