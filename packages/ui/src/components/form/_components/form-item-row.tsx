import { cn } from "@acme/ui/lib/utils";
import { FieldError, Field as ShadcnField } from "@acme/ui/shadcn/field";

import type { ColProps } from "../../grid";
import type { FormLabelAlign, FormLayout } from "../types";
import { FieldDescription, FieldLabel } from "../../field";
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
  colon,
  labelCol,
  labelAlign,
  labelWrap,
  wrapperCol,
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

  className?: string;
  layout?: FormLayout;
  colon?: boolean;
  labelCol?: ColProps;
  labelAlign?: FormLabelAlign;
  labelWrap?: boolean;
  wrapperCol?: ColProps;

  errors?: Array<{ message?: string } | undefined>;
}) => {
  const formLabelNodes = [
    label ? (
      <FieldLabel
        key="form-item-label"
        htmlFor={id ? `${id}-${name}` : undefined}
        required={required}
        colon={colon}
        className={cn(layout === "horizontal" && "h-control")}
      >
        {label}
      </FieldLabel>
    ) : null,
  ];

  const formControlNodes = [
    children ? (
      <div
        key="form-item-control-input"
        data-slot="form-item-control-input"
        className={cn(
          "min-h-control flex items-center",
          layout === "vertical" && "*:w-full",
        )}
      >
        {children}
      </div>
    ) : null,
    description ? (
      <FieldDescription key="form-item-description">
        {description}
      </FieldDescription>
    ) : null,
    invalid ? (
      <div
        key="form-item-additional"
        data-slot="form-item-additional"
        className="min-h-6 leading-[22px]"
      >
        <FieldError errors={errors} />
      </div>
    ) : null,
  ];

  return (
    <ShadcnField
      data-slot="form-item"
      data-invalid={invalid}
      className={cn(
        invalid ? "mb-0" : "mb-6",
        "gap-x-3 gap-y-1",
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
            className={cn(
              "flex-1",
              !label && layout !== "vertical" && "ml-auto",
            )}
            style={{
              width: label ? undefined : "100%",
            }}
            offset={label ? undefined : 8}
            {...wrapperCol}
          >
            {formControlNodes}
          </Col>
        </Row>
      ) : null}
      {!labelCol && !labelAlign && !labelWrap && !wrapperCol
        ? formLabelNodes
        : null}
      {!labelCol && !labelAlign && !labelWrap && !wrapperCol
        ? formControlNodes
        : null}
    </ShadcnField>
  );
};

export { FormItemRow };
