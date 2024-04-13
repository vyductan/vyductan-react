import type { Key } from "react";
import { Fragment } from "react";

import { clsm } from "..";

type BreadcrumbsItem = { key?: Key; label: React.ReactNode; active?: boolean };
type BreadcrumbsProps = {
  items: BreadcrumbsItem[];
};
const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  return (
    <nav>
      <ol className="flex gap-2">
        {items.map((x, index) => {
          const key = x.key ?? index;
          return (
            <Fragment key={key}>
              <li className={clsm(!x.active && "text-secondary")}>{x.label}</li>
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
export { Breadcrumbs };
