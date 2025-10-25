import { cn } from "@/lib/utils";

import { BreadcrumbLink as ShadcnBreadcrumbLink } from "@acme/ui/shadcn/breadcrumb";

const BreadcrumbLink = ({
  className,
  ...props
}: React.ComponentProps<typeof ShadcnBreadcrumbLink>) => {
  return (
    <ShadcnBreadcrumbLink
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
};

export { BreadcrumbLink };
