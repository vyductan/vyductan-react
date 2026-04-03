import { cn } from "@acme/ui/lib/utils";
import { Field as ShadField } from "@acme/ui/shadcn/field";

type FieldProps = React.ComponentProps<typeof ShadField>;

const Field = ({ className, ...props }: FieldProps) => {
  return <ShadField className={cn("gap-2", className)} {...props} />;
};

export { Field };
