import * as React from "react";
import Link from "next/link";

import { clsm } from "@acme/ui";

import type { ButtonProps } from "../button";
import { buttonVariants } from "../button";
import { Icon } from "../icons";

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={clsm("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={clsm("flex flex-row items-center gap-1", className)}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

type PaginationItemProps = React.ComponentProps<"li">;

const PaginationItem = React.forwardRef<HTMLLIElement, PaginationItemProps>(
  ({ className, ...props }, ref) => {
    return (
      <li ref={ref} className={clsm("select-none", className)} {...props} />
    );
  },
);
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, "disabled" | "size" | "shape"> &
  React.ComponentProps<typeof Link>;

const PaginationLink = ({
  className,
  disabled,
  isActive,
  size,
  shape = "icon",
  children,
  ...props
}: PaginationLinkProps) => (
  <Link
    aria-current={isActive ? "page" : undefined}
    className={clsm(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
        shape,
        disabled,
      }),
      className,
    )}
    {...props}
  >
    {children}
  </Link>
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    className={clsm(className)}
    {...props}
  >
    <Icon icon="mingcute:left-fill" className="size-4" />
  </PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    className={clsm(className)}
    {...props}
  >
    <Icon icon="mingcute:right-fill" className="size-4" />
  </PaginationLink>
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={clsm("flex size-9 items-center justify-center", className)}
    {...props}
  >
    <Icon icon="mingcute:more-1-fill" className="size-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

const PaginationTotal = ({
  className,
  ...props
}: React.ComponentProps<"li">) => {
  return <li className={clsm("", className)} {...props} />;
};
PaginationTotal.displayName = "PaginationTotal";

export type { PaginationItemProps };
export {
  Pagination as PaginationRoot,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationTotal,
};
