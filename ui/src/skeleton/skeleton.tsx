import { cn } from "..";

function Skeleton({
  as,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  as?: React.ElementType;
}) {
  const Comp = as ?? "div";
  return (
    <Comp
      // className={cn("animate-pulse rounded-md bg-muted", className)}
      className={cn(
        "animate-skeleton-loading rounded-md bg-[linear-gradient(270deg,#fafafa,#eaeaea,#eaeaea,#fafafa)] bg-[length:400%_100%]",
        "h-4 w-full",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
