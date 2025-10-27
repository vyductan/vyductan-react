import { cn } from "@/lib/utils";

import type { ColProps } from "../../grid";
import type { FormLabelAlign, FormLayout } from "../types";
import {
  FieldError,
  Field as ShadcnField,
  FieldDescription as ShadcnFieldDescription,
} from "../../../shadcn/field";
import { FieldLabel } from "../../field";
import { Col, Row } from "../../grid";

const FormItemRow = ({
  id,
  name,
  invalid,
  required,
  label,
  description,
  className,
  layout,
  labelCol,
  labelAlign,
  labelWrap,
  wrapperCol,
  colon,
  errors,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  id?: string;
  name?: string;

  invalid?: boolean;

  required?: boolean;

  label?: React.ReactNode;
  description?: React.ReactNode;

  layout?: FormLayout;
  labelCol?: ColProps;
  labelAlign?: FormLabelAlign;
  labelWrap?: boolean;
  wrapperCol?: ColProps;
  colon?: boolean;

  errors?: Array<{ message?: string } | undefined>;
}) => {
  const formLabelNodes = [
    label ? (
      <FieldLabel
        key="form-item-label"
        htmlFor={id ? `${id}-${name}` : undefined}
        required={required}
        colon={colon}
        className="h-control"
      >
        {label}
      </FieldLabel>
    ) : null,
    description ? (
      <ShadcnFieldDescription key="form-item-description">
        {description}
      </ShadcnFieldDescription>
    ) : null,
  ];

  const formControlNodes = [
    children ? (
      <div
        key="form-item-control-input"
        data-slot="form-item-control-input"
        className={cn("min-h-control")}
      >
        {children}
      </div>
    ) : null,
    invalid ? (
      <div key="form-item-additional" data-slot="form-item-additional">
        <FieldError errors={errors} />
      </div>
    ) : null,
  ];

  return (
    <ShadcnField
      data-slot="form-item"
      data-invalid={invalid}
      className={cn(
        "mb-6 gap-x-3 gap-y-1",
        layout === "vertical" ? "flex-col" : "flex-row",
        className,
      )}
      orientation={layout}
      {...props}
    >
      {labelCol || labelAlign || labelWrap || wrapperCol ? (
        <Row
          data-slot="form-item-row"
          className={cn(
            "gap-y-1",
            layout === "vertical" ? "flex-col" : "flex-row",
          )}
        >
          {label ? (
            <Col
              data-slot={
                labelCol ? `col-${labelCol.span}-form-item-label` : undefined
              }
              className={cn(
                "pr-3 text-end",
                layout === "vertical" && "text-start",
                labelAlign === "left" && "text-left",
                labelAlign === "right" && "text-right",
                labelWrap === false &&
                  "overflow-hidden text-ellipsis whitespace-nowrap",
              )}
              {...labelCol}
            >
              {formLabelNodes}
            </Col>
          ) : null}
          <Col
            data-slot={
              wrapperCol
                ? `col-${wrapperCol.span}-form-item-control`
                : undefined
            }
            className={cn("flex-1", !label && "ml-auto")}
            style={{
              width: label ? undefined : "100%",
            }}
            offset={label ? undefined : 8}
            {...wrapperCol}
          >
            <div
              data-slot="form-item-control-input"
              className={cn("min-h-control")}
            >
              {children}
            </div>
            {invalid && (
              <div data-slot="form-item-additional">
                <FieldError errors={errors} />
              </div>
            )}
          </Col>
        </Row>
      ) : null}
      {!labelCol && !labelAlign && !labelWrap && !wrapperCol
        ? formLabelNodes
        : null}
      {!labelCol && !labelAlign && !labelWrap && !wrapperCol
        ? formControlNodes
        : null}
      {invalid && <div className="-mb-8" />}
    </ShadcnField>
  );
};

export { FormItemRow };
