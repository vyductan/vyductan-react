import { cn } from "@acme/ui/lib/utils";

export const PageTitle = ({
  className,
  ...properties
}: React.ComponentProps<"h1">) => {
  return <h1 {...properties} className={cn("text-2xl font-bold", className)} />;
};
