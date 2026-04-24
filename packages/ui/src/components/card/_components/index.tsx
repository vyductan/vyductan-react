import { useContext } from "react";

import { cn } from "@acme/ui/lib/utils";
import {
  CardAction as ShadcnCardAction,
  CardContent as ShadcnCardContent,
  CardFooter as ShadcnCardFooter,
  CardHeader as ShadcnCardHeader,
  Card as ShadcnCardRoot,
  CardTitle as ShadcnCardTitle,
} from "@acme/ui/shadcn/card";

import type { SizeType } from "../../config-provider/size-context";
import { CardContext } from "../context";

type CardRootProperties = Omit<
  React.ComponentProps<typeof ShadcnCardRoot>,
  "size"
> & {
  size?: SizeType;
  bordered?: boolean;
};
const CardRoot = ({
  size,
  bordered = true,
  className,
  ...properties
}: CardRootProperties) => {
  return (
    <ShadcnCardRoot
      data-size={size}
      className={cn(
        "group/card bg-card text-card-foreground gap-0 overflow-hidden rounded-xl py-0 text-sm *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
        size === "small" && "gap-0 py-0",
        bordered ? "" : "border-none shadow-none",
        className,
      )}
      {...properties}
    />
  );
};

const CardHeader = ({
  size: sizeProperty,
  className,
  ...properties
}: React.ComponentProps<typeof ShadcnCardHeader> & {
  size?: SizeType;
}) => {
  const context = useContext(CardContext);
  const size = context.size ?? sizeProperty;
  return (
    <ShadcnCardHeader
      className={cn(
        "peer/card-header group/card-header gap-0.5 rounded-t-xl p-4 pb-2 has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4",
        size === "small" && "gap-0.5 p-3 pb-2 [.border-b]:pb-3",
        className,
      )}
      {...properties}
    />
  );
};

const CardTitle = ({
  size: sizeProperty,
  className,
  ...properties
}: React.ComponentProps<typeof ShadcnCardTitle> & {
  size?: SizeType;
}) => {
  const context = useContext(CardContext);
  const size = context.size ?? sizeProperty;
  return (
    <ShadcnCardTitle
      className={cn(
        "text-base leading-snug font-medium",
        size === "small" && "text-sm",
        className,
      )}
      {...properties}
    />
  );
};

const CardAction = ({
  className,
  ...properties
}: React.ComponentProps<typeof ShadcnCardAction>) => {
  return <ShadcnCardAction className={className} {...properties} />;
};

const CardContent = ({
  size: sizeProperty,
  className,
  ...properties
}: React.ComponentProps<typeof ShadcnCardContent> & {
  size?: SizeType;
}) => {
  const context = useContext(CardContext);
  const size = context.size ?? sizeProperty;
  return (
    <ShadcnCardContent
      className={cn(
        "p-4 pt-0 peer-[.border-b]/card-header:pt-4",
        size === "small" && "p-3 pt-0 peer-[.border-b]/card-header:pt-3",
        className,
      )}
      {...properties}
    />
  );
};

const CardFooter = ({
  size: sizeProperty,
  className,
  ...properties
}: React.ComponentProps<typeof ShadcnCardFooter> & {
  size?: SizeType;
}) => {
  const context = useContext(CardContext);
  const size = context.size ?? sizeProperty;
  return (
    <ShadcnCardFooter
      className={cn(
        "bg-muted/50 rounded-b-xl border-t p-4 [.border-t]:pt-4 group-data-[size=small]/card:p-3",
        size === "small" && "p-3 [.border-t]:pt-3",
        className,
      )}
      {...properties}
    />
  );
};

export type { CardRootProperties as CardRootProps };

export { CardRoot, CardHeader, CardTitle, CardAction, CardContent, CardFooter };

export { CardDescription } from "@acme/ui/shadcn/card";
