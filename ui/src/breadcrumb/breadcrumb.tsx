import type { Key } from "react";
import { Fragment } from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "..";
import { Icon } from "../icons";
import { Skeleton } from "../skeleton";

type BreadcrumbItem = {
  key?: Key;
  title: React.ReactNode;
  href?: string;
  icon?: React.ReactNode;
  className?: string;
};
type BreadcrumbProps<
  T extends Record<string, string> = Record<string, string>,
> = {
  items: BreadcrumbItem[];
  className?: string;
  itemRender?: (
    route: BreadcrumbItem,
    params: T,
    routes: BreadcrumbItem[],
    paths: string[],
  ) => React.ReactNode;
  skeleton?: boolean;
};
const Breadcrumb = ({ items = [], className, skeleton }: BreadcrumbProps) => {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex gap-2">
        {items.map((x, index) => {
          const key = x.key ?? index;
          return (
            <Fragment key={key}>
              <Slot
                className={cn(
                  index !== items.length - 1 && "text-secondary",
                  "-mx-1 rounded px-1",
                  // "hover:bg-background-hover",
                )}
                aria-current={index === items.length - 1 ? true : undefined}
              >
                {skeleton ? (
                  <Skeleton as="li" className="w-20" />
                ) : (
                  <li>
                    {x.icon && (
                      <span className="mr-2">
                        {typeof x.icon === "string" ? (
                          <Icon icon={x.icon} />
                        ) : (
                          x.icon
                        )}
                      </span>
                    )}
                    {x.title}
                  </li>
                )}
              </Slot>
              {index < items.length - 1 && (
                <li className="text-secondary"> / </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export type { BreadcrumbItem, BreadcrumbProps };
export { Breadcrumb };
