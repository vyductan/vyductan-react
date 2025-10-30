import { cn } from "@acme/ui/lib/utils";
import { Label as ShadLabel } from "@acme/ui/shadcn/label";

const Label = ({
  className,
  children,
  required,
  colon,
  asChild,
  ...props
}: React.ComponentProps<typeof ShadLabel> & {
  required?: boolean;
  colon?: boolean;
}) => {
  if (asChild) {
    return (
      <ShadLabel asChild className={className} {...props}>
        {children}
      </ShadLabel>
    );
  }
  return (
    <ShadLabel className={cn("gap-0", className)} {...props}>
      {children}
      {colon && ":"}
      {required && <span className="ml-1 text-red-600">*</span>}
    </ShadLabel>
  );
};

export { Label };
