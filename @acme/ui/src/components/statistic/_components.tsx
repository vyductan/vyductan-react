import { cn } from "@acme/ui/lib/utils";

export const StatisticRoot = ({
  className,
  ...properties
}: React.ComponentProps<"div">) => {
  return <div className={cn("space-y-1", className)} {...properties} />;
};
export const StatisticTitle = ({
  className,
  ...properties
}: React.ComponentProps<"div">) => {
  return (
    <div
      className={cn("text-sm text-muted-foreground", className)}
      {...properties}
    />
  );
};
export const StatisticValue = ({
  className,
  ...properties
}: React.ComponentProps<"div">) => {
  return (
    <div className={cn("text-2xl font-bold", className)} {...properties} />
  );
};
