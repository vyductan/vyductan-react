import type { DetailedHTMLProps, HTMLAttributes } from "react";

import type { DropdownProps } from "@acme/ui/dropdown";
import { Button } from "@acme/ui/button";
import { Dropdown } from "@acme/ui/dropdown";
import { Icon } from "@acme/ui/icons";

type ButtonActionsProps = DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & {
  dropdown?: DropdownProps["menu"]["items"];
};
export const ButtonActions = ({
  children,
  dropdown,
  ...props
}: ButtonActionsProps) => {
  return (
    <>
      <div className="hidden items-center gap-2 sm:flex" {...props}>
        {children}
      </div>
      {dropdown && (
        <Dropdown
          placement="bottomRight"
          className="sm:hidden"
          menu={{
            items: dropdown,
          }}
          asChild
        >
          <Button
            variant="ghost"
            icon={<Icon icon="icon-[mingcute--more-1-fill]" srOnly="More" />}
          />
        </Dropdown>
      )}
    </>
  );
};
