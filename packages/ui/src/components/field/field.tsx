import { cn } from "@acme/ui/lib/utils";
import {
  Field as ShadField,
  FieldDescription as ShadFieldDescription,
  FieldError as ShadFieldError,
  FieldGroup as ShadFieldGroup,
} from "@acme/ui/shadcn/field";

type FieldProperties = React.ComponentProps<typeof ShadField>;
type FieldDescriptionProperties = React.ComponentProps<typeof ShadFieldDescription>;
type FieldGroupProperties = React.ComponentProps<typeof ShadFieldGroup>;
type FieldErrorProperties = React.ComponentProps<typeof ShadFieldError>;

const Field = ({ className, ...properties }: FieldProperties) => {
  return <ShadField className={cn("gap-2", className)} {...properties} />;
};

const FieldDescription = ({
  className,
  ...properties
}: FieldDescriptionProperties) => {
  return <ShadFieldDescription className={cn("text-xs", className)} {...properties} />;
};

const FieldLegendDescription = ({
  className,
  ...properties
}: FieldDescriptionProperties) => {
  return <FieldDescription className={cn("text-sm", className)} {...properties} />;
};

const FieldGroup = ({ className, ...properties }: FieldGroupProperties) => {
  return <ShadFieldGroup className={cn("gap-6", className)} {...properties} />;
};

const FieldError = ({ className, errors, children, ...properties }: FieldErrorProperties) => {
  const hasContent = Boolean(children) || errors?.some((error) => error?.message);

  if (!hasContent) {
    return (
      <div
        data-slot="field-error"
        className={cn("min-h-6 text-sm font-normal text-destructive", className)}
        {...properties}
      />
    );
  }

  return (
    <ShadFieldError
      className={cn("min-h-6", className)}
      errors={errors}
      {...properties}
    >
      {children}
    </ShadFieldError>
  );
};

export { Field, FieldDescription, FieldError, FieldGroup, FieldLegendDescription };
