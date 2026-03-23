import { cn } from "@acme/ui/lib/utils";

export const PageTitle = ({
  className,
  ...props
}: React.ComponentProps<"h1">) => {
  return <h1 {...props} className={cn("text-2xl font-bold", className)} />;
};
