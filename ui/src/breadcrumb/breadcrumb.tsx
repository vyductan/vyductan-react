import type { Key } from "react";
import { Fragment } from "react";
import { Slot } from "@radix-ui/react-slot";

import { clsm } from "..";
import { Skeleton } from "../skeleton";

type BreadcrumbsItem = { key?: Key; title: React.ReactNode; href?: string };
type BreadcrumbsProps<
  T extends Record<string, string> = Record<string, string>,
> = {
  items: BreadcrumbsItem[];
  className?: string;
  itemRender?: (
    route: BreadcrumbsItem,
    params: T,
    routes: BreadcrumbsItem[],
    paths: string[],
  ) => React.ReactNode;
  skeleton?: boolean;
};
const Breadcrumb = ({ items = [], className, skeleton }: BreadcrumbsProps) => {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex gap-2">
        {items.map((x, index) => {
          const key = x.key ?? index;
          return (
            <Fragment key={key}>
              <Slot
                className={clsm(
                  index !== items.length - 1 && "text-secondary",
                  "-mx-1 rounded px-1",
                  "hover:bg-background-hover",
                )}
                aria-current={index === items.length - 1 ? true : undefined}
              >
                {skeleton ? (
                  <Skeleton as="li" className="w-20" />
                ) : (
                  <li>{x.title}</li>
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

export type { BreadcrumbsItem, BreadcrumbsProps };
export { Breadcrumb as Breadcrumbs };
