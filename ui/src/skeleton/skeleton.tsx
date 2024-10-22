import { clsm } from "..";

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
      // className={clsm("animate-pulse rounded-md bg-muted", className)}
      className={clsm(
        "animate-skeleton-loading rounded-md bg-[linear-gradient(270deg,#fafafa,#eaeaea,#eaeaea,#fafafa)] bg-[length:400%_100%]",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
