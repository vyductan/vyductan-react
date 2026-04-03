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

type ShadcnBreadcrumbProps = React.ComponentProps<typeof ShadcnBreadcrumb>;

type BreadcrumbItemDef = {
  key?: Key;
  title: React.ReactNode;
  href?: string;
  icon?: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLLIElement>;
};
type OwnBreadcrumbProps<TParams extends AnyObject = AnyObject> = {
  items?: BreadcrumbItemDef[];
  params?: TParams;
  itemRender?: (
    route: BreadcrumbItemDef,
    params: TParams,
    routes: BreadcrumbItemDef[],
    paths: string[],
  ) => React.ReactNode;
  className?: string;
  skeleton?: boolean;
  separator?: React.ReactNode;
};
type BreadcrumbProps<TParams extends AnyObject = AnyObject> = XOR<
  ShadcnBreadcrumbProps,
  OwnBreadcrumbProps<TParams>
>;
const Breadcrumb = (props: BreadcrumbProps) => {
  const isShadcnBreadcrumb = !props.items;
  if (isShadcnBreadcrumb) {
    return <ShadcnBreadcrumb className="hidden" {...props} />;
  }

  const {
    items = [],
    className,
    skeleton,
    params,
    itemRender: itemRenderProp,
    separator,
  } = props;
  return (
    <ShadcnBreadcrumb className={items.length === 1 ? "hidden" : className}>
      <BreadcrumbList>
        {items.map((x, index) => {
          const key = x.key ?? index;
          // if(skeleton) {
          //   return <Skeleton key={key} as="li" className="w-20" />
          // }
          const itemRender = itemRenderProp ? (
            itemRenderProp(x, params ?? {}, items, [])
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
                <li>
                  <Skeleton className="h-4 w-20" />
                </li>
              ) : index < items.length - 1 ? (
                x.href || x.icon || x.onClick ? (
                  <>
                    {x.href && !itemRender ? (
                      <BreadcrumbLink>{itemRender}</BreadcrumbLink>
                    ) : (
                      <BreadcrumbItem>{itemRender}</BreadcrumbItem>
                    )}
                  </>
                ) : (
                  <BreadcrumbItem>{x.title}</BreadcrumbItem>
                )
              ) : (
                <BreadcrumbItem>
                  <BreadcrumbPage>{itemRender}</BreadcrumbPage>
                </BreadcrumbItem>
              )}
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

export type { BreadcrumbItemDef, BreadcrumbProps, OwnBreadcrumbProps };
export { Breadcrumb };

export { BreadcrumbLink } from "./_components";

export {
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbItem,
} from "@acme/ui/shadcn/breadcrumb";
