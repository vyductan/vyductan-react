import { clsm } from "..";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
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
