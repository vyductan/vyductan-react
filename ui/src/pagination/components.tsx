import * as React from "react";

import { Icon } from "@vyductan/icons";
import { clsm } from "@vyductan/utils";

import type { ButtonProps } from "../button";
import { buttonVariants } from "../button";

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

type PaginationItemProps = {
  page?: number;
  onClick: (page?: number) => void;
  onKeyUp?: (
    e: React.KeyboardEvent<HTMLLIElement>,
    onClick: PaginationItemProps["onClick"],
    page: PaginationItemProps["page"],
  ) => void;

  active?: boolean;
  disabled?: boolean;
  showTitle?: boolean;
} & Omit<React.ComponentProps<"li">, "onClick" | "onKeyUp"> &
  Pick<ButtonProps, "size" | "shape">;
const PaginationItem = React.forwardRef<HTMLLIElement, PaginationItemProps>(
  (
    {
      page,
      onClick,
      onKeyUp,
      className,
      disabled,
      showTitle,
      active,
      children,

      shape,
      size,
      ...props
    },
    ref,
  ) => {
    const handleClick = () => {
      onClick?.(page);
    };
    const handleKeyPress = (e: React.KeyboardEvent<HTMLLIElement>) => {
      onKeyUp?.(e, onClick, page);
    };
    return (
      <li
        ref={ref}
        className={clsm("cursor-pointer select-none", className)}
        tabIndex={disabled ? undefined : 0}
        title={showTitle ? String(page) : undefined}
        onClick={handleClick}
        onKeyUp={handleKeyPress}
        role="presentation"
        {...props}
      >
        <PaginationLink
          rel="nofollow"
          isActive={active}
          size={size}
          shape={shape}
          // href="#"
          // href="#asd"
          // aria-current={active ? "page" : undefined}
          // className={clsm(
          //   buttonVariants({
          //     variant: active ? "default" : "ghost",
          //     size,
          //   }),
          //   className,
          // )}
        >
          {children ?? page}
        </PaginationLink>
      </li>
    );
  },
);
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, "size" | "shape"> &
  React.ComponentProps<"a">;

const PaginationLink = ({
  className,
  isActive,
  size = "default",
  shape,
  children,
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={clsm(
      buttonVariants({
        variant: isActive ? "default" : "ghost",
        size,
        shape,
      }),
      className,
    )}
    {...props}
  >
    {children}
  </a>
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={clsm("gap-1 pl-2.5", className)}
    {...props}
  >
    <Icon icon="mingcute:left-fill" className="size-4" />
    <span>Previous</span>
  </PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={clsm("gap-1 pr-2.5", className)}
    {...props}
  >
    <span>Next</span>
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
