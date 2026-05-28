import type { Key } from "react";
import type { XOR } from "ts-xor";
import { Fragment } from "react";

import {
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Breadcrumb as ShadcnBreadcrumb,
} from "@acme/ui/shadcn/breadcrumb";

import type { AnyObject } from "../_util/type";
import { Icon } from "../../icons";
import { Skeleton } from "../skeleton";
import { BreadcrumbLink } from "./_components";

type ShadcnBreadcrumbProperties = React.ComponentProps<typeof ShadcnBreadcrumb>;

type BreadcrumbItemDef = {
  key?: Key;
  title: React.ReactNode;
  href?: string;
  icon?: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLLIElement>;
};
type OwnBreadcrumbProperties<TParameters extends AnyObject = AnyObject> = {
  items?: BreadcrumbItemDef[];
  params?: TParameters;
  itemRender?: (
    route: BreadcrumbItemDef,
    parameters: TParameters,
    routes: BreadcrumbItemDef[],
    paths: string[],
  ) => React.ReactNode;
  className?: string;
  skeleton?: boolean;
  separator?: React.ReactNode;
};
type BreadcrumbProperties<TParameters extends AnyObject = AnyObject> = XOR<
  ShadcnBreadcrumbProperties,
  OwnBreadcrumbProperties<TParameters>
>;
const Breadcrumb = (properties: BreadcrumbProperties) => {
  const isShadcnBreadcrumb = !properties.items;
  if (isShadcnBreadcrumb) {
    return <ShadcnBreadcrumb className="hidden" {...properties} />;
  }

  const {
    items = [],
    className,
    skeleton,
    params,
    itemRender: itemRenderProperty,
    separator,
  } = properties;
  return (
    <ShadcnBreadcrumb className={items.length === 1 ? "hidden" : className}>
      <BreadcrumbList>
        {items.map((x, index) => {
          const key = x.key ?? index;
          // if(skeleton) {
          //   return <Skeleton key={key} as="li" className="w-20" />
          // }
          const itemRender = itemRenderProperty ? (
            itemRenderProperty(x, params ?? {}, items, [])
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
          let content: React.ReactNode;

          if (skeleton) {
            content = (
              <li>
                <Skeleton className="h-4 w-20" />
              </li>
            );
          } else if (index === items.length - 1) {
            content = (
              <BreadcrumbItem>
                <BreadcrumbPage>{itemRender}</BreadcrumbPage>
              </BreadcrumbItem>
            );
          } else if (x.href || x.icon || x.onClick) {
            content =
              x.href && !itemRender ? (
                <BreadcrumbLink>{itemRender}</BreadcrumbLink>
              ) : (
                <BreadcrumbItem>{itemRender}</BreadcrumbItem>
              );
          } else {
            content = <BreadcrumbItem>{x.title}</BreadcrumbItem>;
          }

          return (
            <Fragment key={key}>
              {content}
              {index < items.length - 1 && (
                <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>
              )}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </ShadcnBreadcrumb>
  );
};

export type {
  BreadcrumbItemDef,
  BreadcrumbProperties as BreadcrumbProps,
  OwnBreadcrumbProperties as OwnBreadcrumbProps,
};
export { Breadcrumb };

export { BreadcrumbLink } from "./_components";

export {
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbItem,
} from "@acme/ui/shadcn/breadcrumb";
