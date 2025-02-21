import type { CardProps } from "./card";
import { cn } from "..";
import {
  CardContent as OriCardContent,
  CardFooter as OriCardFooter,
  CardRoot as OriCardRoot,
  CardTitle as OriCardTitle,
} from "./_shadcn";

function CardRoot({
  size,
  className,
  ...props
}: React.ComponentProps<typeof OriCardRoot> & {
  size?: CardProps["size"];
}) {
  return (
    <OriCardRoot
      className={cn(size === "sm" && "gap-3", className)}
      {...props}
    />
  );
}

function CardTitle({
  className,
  ...props
}: React.ComponentProps<typeof OriCardTitle>) {
  return (
    <OriCardTitle
      className={cn(
        "flex-1", // fix if not has extra the title width not full
        className,
      )}
      {...props}
    />
  );
}

function CardContent({
  className,
  size,
  ...props
}: React.ComponentProps<typeof OriCardContent> & {
  size?: CardProps["size"];
}) {
  return (
    <OriCardContent
      className={cn(size === "sm" && "px-3", className)}
      {...props}
    />
  );
}

function CardFooter({
  className,
  size,
  ...props
}: React.ComponentProps<typeof OriCardFooter> & {
  size?: CardProps["size"];
}) {
  return (
    <OriCardFooter
      className={cn(size === "sm" && "px-3", className)}
      {...props}
    />
  );
}

export { CardRoot, CardTitle, CardContent, CardFooter };

export { CardHeader, CardDescription } from "./_shadcn";
