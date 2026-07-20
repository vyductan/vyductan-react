import { useContext } from "react";

import { cn } from "@acme/ui/lib/utils";
import { FieldLabel as ShadFieldLabel } from "@acme/ui/shadcn/field";

import type { FormLabelAlign } from "../form";
import type { ColProps as ColProperties } from "../grid";
import useSize from "../config-provider/hooks/use-size";
import { useFormContext } from "../form";
import { FormFieldContext } from "../form/context";
import { useRequiredFieldCheck } from "../form/hooks/use-field-optionality-check";
import { Col } from "../grid";

type FieldLabelProperties = React.ComponentProps<typeof ShadFieldLabel> & {
  labelCol?: ColProperties;
  labelAlign?: FormLabelAlign;
  labelWrap?: boolean;
  colon?: boolean;
  required?: boolean;
  /** Node pinned to the far right of the label row (e.g. a "Forgot?" link).
   * Rendered as a sibling of the <label>, not a child, so interactive content
   * keeps its own focus target. Intended for the vertical layout. */
  labelExtra?: React.ReactNode;
};
const FieldLabel = ({
  className,
  labelCol,
  labelAlign,
  labelWrap,
  colon,
  required,
  labelExtra,
  children,
  ...properties
}: FieldLabelProperties) => {
  const formContext = useFormContext();
  const layout = formContext?.layout;

  const mergedLabelCol = labelCol ?? formContext?.labelCol;
  const mergedLabelAlign = labelAlign ?? formContext?.labelAlign;
  const mergedLabelWrap = labelWrap ?? formContext?.labelWrap;
  const mergedColon = colon ?? formContext?.colon;

  const formFieldContext = useContext(FormFieldContext);
  const inferredRequired = useRequiredFieldCheck(formFieldContext?.name);
  const mergedRequired = required ?? inferredRequired ?? false;

  // Shrink the label one step at the small size so it stops dominating a
  // compact (h-6) control; middle/large keep the default text-sm.
  const size = useSize();

  const labelNode = (
    <ShadFieldLabel
      className={cn(
        "inline-flex gap-0 select-text",
        size === "small" && "text-xs",
        // layout === "vertical" ? "pb-2" : "",
        layout === "horizontal" && !mergedLabelCol ? "h-control" : "",
        // Label alignment
        mergedLabelAlign === "left" && "text-left",
        mergedLabelAlign === "right" && "text-right",
        // Label wrap
        mergedLabelWrap === false &&
          "overflow-hidden text-ellipsis whitespace-nowrap",
        className,
      )}
      {...properties}
    >
      {children}
      {mergedColon && ":"}
      {mergedRequired && <span className="text-destructive ml-1">*</span>}
    </ShadFieldLabel>
  );

  // Pin labelExtra to the row's far right, as a SIBLING of the <label> (so a
  // link/button inside it keeps its own focus target instead of triggering the
  // label). Vertical-focused: the label spans the row above the control.
  const rowNode = labelExtra ? (
    <div className="flex w-full items-center justify-between gap-2">
      {labelNode}
      <span className="text-muted-foreground text-xs font-normal">
        {labelExtra}
      </span>
    </div>
  ) : (
    labelNode
  );

  return labelCol ? <Col {...labelCol}>{rowNode}</Col> : rowNode;
};

export { FieldLabel };
