import type { Key } from "react";
import { Fragment } from "react";

import { Icon } from "../icons";
import { Skeleton } from "../skeleton";
import {
  BreadcrumbItem,
  BreadcrumbLink,
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
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};
type BreadcrumbProps<
  TParams extends Record<string, string> = Record<string, string>,
> = {
  items?: BreadcrumbItemDef[];
  params?: Record<string, string>;
  itemRender?: (
    route: BreadcrumbItemDef,
    params: TParams | undefined,
    routes: BreadcrumbItemDef[],
    paths: string[],
  ) => React.ReactNode;
  className?: string;
  skeleton?: boolean;
};
const Breadcrumb = ({
  items = [],
  className,
  skeleton,
  params,
  itemRender: itemRenderProp,
}: BreadcrumbProps) => {
  return (
    <BreadcrumbRoot className={items.length === 1 ? "hidden" : className}>
      <BreadcrumbList>
        {items.map((x, index) => {
          const key = x.key ?? index;
          // if(skeleton) {
          //   return <Skeleton key={key} as="li" className="w-20" />
          // }
          const itemRender = itemRenderProp ? (
            itemRenderProp(x, params, items, [])
          ) : (
            <>
              {x.icon && (
                <span className="mr-2">
                  {typeof x.icon === "string" ? <Icon icon={x.icon} /> : x.icon}
                </span>
              )}
              {x.title}
            </>
          );
          return (
            <Fragment key={key}>
              {skeleton ? (
                <Skeleton as="li" className="w-20" />
              ) : x.href || x.icon || x.onClick ? (
                index < items.length - 1 ? (
                  <>
                    {x.href && !itemRender ? (
                      <BreadcrumbLink>{itemRender}</BreadcrumbLink>
                    ) : (
                      <BreadcrumbItem>{itemRender}</BreadcrumbItem>
                    )}
                  </>
                ) : (
                  <BreadcrumbPage>{itemRender}</BreadcrumbPage>
                )
              ) : (
                x.title
              )}
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
