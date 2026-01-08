import type { ReactNode } from "react";

import { Avatar } from "@acme/ui/components/avatar";

interface ListItemMetaProps {
  avatar?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}

const ListItemMeta = ({
  avatar,
  title,
  description,
  children,
}: ListItemMetaProps) => {
  return (
    <div data-slot="list-item-meta" className="flex items-start gap-3">
      {avatar && (
        <div className="shrink-0">
          {typeof avatar === "string" ? <Avatar src={avatar} /> : avatar}
        </div>
      )}
      <div className="min-w-0 flex-1">
        {title && (
          <div className="text-sm leading-snug font-medium">{title}</div>
        )}
        {description && (
          <div className="text-muted-foreground mt-1 text-sm leading-normal">
            {description}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export { ListItemMeta };
