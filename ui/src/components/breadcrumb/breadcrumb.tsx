import type { Key } from "react";
import type { XOR } from "ts-xor";
import { Fragment } from "react";

import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Breadcrumb as ShadcnBreadcrumb,
} from "@acme/ui/shadcn/breadcrumb";

import { Icon } from "../../icons";
import { Skeleton } from "../skeleton";

type ShadcnBreadcrumbProps = React.ComponentProps<typeof ShadcnBreadcrumb>;

type BreadcrumbItemDef = {
  key?: Key;
  title: React.ReactNode;
  href?: string;
  icon?: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};
type OwnBreadcrumbProps<
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
type BreadcrumbProps<
  TParams extends Record<string, string> = Record<string, string>,
> = XOR<ShadcnBreadcrumbProps, OwnBreadcrumbProps<TParams>>;
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
                <Skeleton asChild className="w-20">
                  <li />
                </Skeleton>
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
    </ShadcnBreadcrumb>
  );
};

export type { BreadcrumbItemDef, BreadcrumbProps, OwnBreadcrumbProps };
export { Breadcrumb };

export {
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbItem,
} from "@acme/ui/shadcn/breadcrumb";
