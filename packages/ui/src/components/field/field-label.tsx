import { useContext } from "react";

import { cn } from "@acme/ui/lib/utils";
import { FieldLabel as ShadFieldLabel } from "@acme/ui/shadcn/field";

import type { FormLabelAlign } from "../form";
import type { ColProps as ColProperties } from "../grid";
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
};
const FieldLabel = ({
  className,
  labelCol,
  labelAlign,
  labelWrap,
  colon,
  required,
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

  const labelNode = (
    <ShadFieldLabel
      className={cn(
        "inline-flex gap-0 select-text",
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

  return labelCol ? <Col {...labelCol}>{labelNode}</Col> : labelNode;
};

export { FieldLabel };
