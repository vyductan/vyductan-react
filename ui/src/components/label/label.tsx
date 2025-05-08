import { cn } from "@acme/ui/lib/utils";
import { Label as ShadLabel } from "@acme/ui/shadcn/label";

const Label = ({
  className,
  children,
  required,
  ...props
}: React.ComponentProps<typeof ShadLabel> & {
  required?: boolean;
}) => {
  return (
    <ShadLabel className={cn("", className)} {...props}>
      {children}
      {required && <span className="text-red-600">*</span>}
    </ShadLabel>
  );
};

export { Label };
