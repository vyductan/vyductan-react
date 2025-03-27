import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import type { ButtonProps } from "../button";
import { cn } from "..";
import { buttonVariants } from "../button";
import { Icon } from "../icons";
import { Link } from "../link";

function PaginationRoot({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

type PaginationItemProps = React.ComponentProps<"li">;
function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, "disabled" | "size" | "shape"> &
  React.ComponentProps<typeof Link> & {
    asChild?: boolean;
  };

function PaginationLink({
  className,
  disabled,
  isActive,
  size,
  shape = "icon",

  asChild,
  ...props
}: PaginationLinkProps) {
  const LinkComp = asChild ? Slot : Link;
  return (
    <LinkComp
      rel="nofollow"
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
          shape,
          disabled,
        }),
        className,
      )}
      {...props}
    />
  );
}

function PaginationPrevious({
  asChild,
  className,
  children: childrenProp,
  ...props
}: Omit<React.ComponentProps<typeof PaginationLink>, "children"> & {
  children?: React.ReactElement<{ children?: React.ReactNode }>;
}) {
  const icon = (
    <>
      <Icon icon="icon-[lucide--chevron-left]" />
      {/* <span className="hidden sm:block">Previous</span> */}
    </>
  );
  const children = childrenProp
    ? React.cloneElement(childrenProp, {
        ...props,
        children: icon,
      })
    : icon;
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
      asChild={asChild}
      {...(children ? props : {})}
    >
      {children}
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  asChild,
  children: childrenProp,
  ...props
}: Omit<React.ComponentProps<typeof PaginationLink>, "children"> & {
  children?: React.ReactElement<{ children?: React.ReactNode }>;
}) {
  const icon = (
    <>
      {/* <span className="hidden sm:block">Next</span> */}
      <Icon icon="icon-[lucide--chevron-right]" />
    </>
  );
  const children = childrenProp
    ? React.cloneElement(childrenProp, {
        ...props,
        children: icon,
      })
    : icon;

  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
      asChild={asChild}
      {...(children ? props : {})}
    >
      {children}
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex items-center justify-center",
        //size-9,
        className,
      )}
      {...props}
    >
      <Icon icon="icon-[lucide--more-horizontal]" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

function PaginationTotal({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="pagination-total"
      className={cn("mr-1 text-sm", className)}
      {...props}
    />
  );
}

export type { PaginationItemProps };
export {
  PaginationRoot,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationTotal,
};
