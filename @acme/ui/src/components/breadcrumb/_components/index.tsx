import { cn } from "@acme/ui/lib/utils";
import { BreadcrumbLink as ShadcnBreadcrumbLink } from "@acme/ui/shadcn/breadcrumb";

const BreadcrumbLink = ({
  className,
  ...properties
}: React.ComponentProps<typeof ShadcnBreadcrumbLink>) => {
  return (
    <ShadcnBreadcrumbLink
      className={cn("text-muted-foreground", className)}
      {...properties}
    />
  );
};

export { BreadcrumbLink };
