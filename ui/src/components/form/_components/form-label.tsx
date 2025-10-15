"use client";

import * as React from "react";

import { cn } from "@acme/ui/lib/utils";
import { FormLabel as ShadFormLabel } from "@acme/ui/shadcn/form";

import type { ColProps } from "../../grid";
import type { FormLabelAlign, FormLayout } from "../types";
import { Col } from "../../grid";
import { Label } from "../../label";
import { useFormContext } from "../context";

type FormItemLabelProps = React.ComponentProps<typeof ShadFormLabel> & {
  layout?: FormLayout;
  label?: React.ReactNode;
  labelAlign?: FormLabelAlign;
  labelCol?: ColProps;

  required?: boolean;
};

const FormLabel = ({
  className,
  layout = "vertical",
  labelAlign,
  labelCol,
  required,
  children,
  asChild,
  ...props
}: FormItemLabelProps) => {
  const formContext = useFormContext();
  const mergedLabelCol = labelCol ?? formContext?.labelCol;
  const mergedLabelAlign = labelAlign ?? formContext?.labelAlign;
  const labelWrap = formContext?.labelWrap;

  const labelNode = (
    <Label required={required} asChild={asChild}>
      {children}
    </Label>
  );

  return (
    <ShadFormLabel
      className={cn(
        // layout === "vertical" ? "pb-2" : "",
        layout === "horizontal" && !mergedLabelCol ? "h-control w-6/24" : "",
        // Label alignment
        mergedLabelAlign === "left" && "text-left",
        mergedLabelAlign === "right" && "text-right",
        // Label wrap
        labelWrap === false &&
          "overflow-hidden text-ellipsis whitespace-nowrap",
        className,
      )}
      asChild
      {...props}
    >
      {labelCol ? <Col {...labelCol}>{labelNode}</Col> : labelNode}
    </ShadFormLabel>
  );
};

export type { FormItemLabelProps };
export { FormLabel as FieldLabel, FormLabel };
