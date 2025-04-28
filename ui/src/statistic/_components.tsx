import { cn } from "@acme/ui/lib/utils";

export const StatisticRoot = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  return <div className={cn("space-y-1", className)} {...props} />;
};
export const StatisticTitle = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  return (
    <div
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
};
export const StatisticValue = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  return <div className={cn("text-2xl font-bold", className)} {...props} />;
};
