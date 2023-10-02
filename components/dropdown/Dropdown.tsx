import { cloneElement, Fragment, ReactElement, ReactNode } from "react";
import Link from "next/link";

import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "./_components";

type MenuItem = {
  key: string;
  label?: ReactNode;
  icon?: ReactElement;
  shortcut?: ReactNode;
  group?: MenuItem[];
  as?: "title" | "separator";
  href?: string;
  onSelect?: (event: Event) => void;
};
type Menu = MenuItem[];
export type DropdownProps = {
  className?: string;
  children: ReactNode;
  menu: Menu;
  overlayClassName?: string;
};

export const Dropdown = ({
  className,
  children,
  menu,
  overlayClassName,
}: DropdownProps) => {
  const renderMenu = (menu: Menu): ReactNode => {
    return menu.map((x) => (
      <Fragment key={x.key}>
        {x.as === "title" ? (
          <DropdownMenuLabel>{x.label}</DropdownMenuLabel>
        ) : x.as === "separator" ? (
          <DropdownMenuSeparator />
        ) : x.group ? (
          renderMenu(x.group)
        ) : (
          <DropdownMenuItem onSelect={x.onSelect} asChild={!!x.href}>
            {x.href ? (
              <Link href={x.href}>
                {x.icon &&
                  cloneElement(x.icon, {
                    className: "mr-2 h-4 w-4",
                  })}
                <span>{x.label}</span>
                {x.shortcut && (
                  <DropdownMenuShortcut>{x.shortcut}</DropdownMenuShortcut>
                )}
              </Link>
            ) : (
              <>
                {x.icon &&
                  cloneElement(x.icon, {
                    className: "mr-2 h-4 w-4",
                  })}
                <span>{x.label}</span>
                {x.shortcut && (
                  <DropdownMenuShortcut>{x.shortcut}</DropdownMenuShortcut>
                )}
              </>
            )}
          </DropdownMenuItem>
        )}
      </Fragment>
    ));
  };
  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger className={className}>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent className={overlayClassName}>
        {renderMenu(menu)}
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
};
