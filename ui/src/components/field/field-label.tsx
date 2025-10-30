import { cn } from "@acme/ui/lib/utils";

import type { FormLabelAlign } from "../form";
import type { ColProps } from "../grid";
import { FieldLabel as ShadFieldLabel } from "../../shadcn/field";
import { useFormContext } from "../form";
import { Col } from "../grid";

type FieldLabelProps = React.ComponentProps<typeof ShadFieldLabel> & {
  labelCol?: ColProps;
  labelAlign?: FormLabelAlign;
  labelWrap?: boolean;
  colon?: boolean;
};
const FieldLabel = ({
  className,
  labelCol,
  labelAlign,
  labelWrap,
  colon,
  //   required,
  children,
  ...props
}: FieldLabelProps) => {
  const formContext = useFormContext();
  const layout = formContext?.layout;

  const mergedLabelCol = labelCol ?? formContext?.labelCol;
  const mergedLabelAlign = labelAlign ?? formContext?.labelAlign;
  const mergedLabelWrap = labelWrap ?? formContext?.labelWrap;
  const mergedColon = colon ?? formContext?.colon;

  const labelNode = (
    <ShadFieldLabel
      className={cn(
        "inline-flex gap-0",
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
      colon={mergedColon}
      {...props}
    >
      {children}
    </ShadFieldLabel>
  );
  return labelCol ? <Col {...labelCol}>{labelNode}</Col> : labelNode;
};

export { FieldLabel };
