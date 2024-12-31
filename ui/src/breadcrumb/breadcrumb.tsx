import type { Key } from "react";
import { Fragment } from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "..";
import { Icon } from "../icons";
import { Skeleton } from "../skeleton";
import {
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbRoot,
  BreadcrumbSeparator,
} from "./_components";

type BreadcrumbItemDef = {
  key?: Key;
  title: React.ReactNode;
  href?: string;
  icon?: React.ReactNode;
  className?: string;
};
type BreadcrumbProps<
  T extends Record<string, string> = Record<string, string>,
> = {
  items?: BreadcrumbItemDef[];
  params?: Record<string, string>;
  itemRender?: (
    route: BreadcrumbItemDef,
    params: T | undefined,
    routes: BreadcrumbItemDef[],
    paths: string[],
  ) => React.ReactNode;
  meta?: Record<string, string>;
  className?: string;
  skeleton?: boolean;
};
const Breadcrumb = ({
  items = [],
  className,
  skeleton,
  params,
  itemRender,
  meta: ___,
}: BreadcrumbProps) => {
  return (
    <BreadcrumbRoot className={items.length === 1 ? "hidden" : className}>
      <BreadcrumbList>
        {items.map((x, index) => {
          const key = x.key ?? index;
          return (
            <Fragment key={key}>
              <Slot
                className={cn(
                  index !== items.length - 1 && "text-foreground-muted",
                  "-mx-1 rounded px-1",
                  // "hover:bg-background-hover",
                )}
                aria-current={index === items.length - 1 ? true : undefined}
              >
                {skeleton ? (
                  <Skeleton as="li" className="w-20" />
                ) : index < items.length - 1 ? (
                  <BreadcrumbItem>
                    {itemRender ? (
                      itemRender(x, params, items, [])
                    ) : (
                      <>
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
                      </>
                    )}
                  </BreadcrumbItem>
                ) : (
                  <BreadcrumbPage>
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
                  </BreadcrumbPage>
                )}
              </Slot>
              {index < items.length - 1 && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </BreadcrumbRoot>
  );
};

export type { BreadcrumbItemDef, BreadcrumbProps };
export { Breadcrumb };
