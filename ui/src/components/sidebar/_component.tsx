import React from "react";

import { SidebarMenuButton as ShadcnSidebarMenuButton } from "@acme/ui/shadcn/sidebar";

import { cn } from "../../lib/utils";

const SidebarMenuButton = ({
  className,
  ...props
}: React.ComponentProps<typeof ShadcnSidebarMenuButton>) => {
  return (
    <ShadcnSidebarMenuButton
      className={cn(
        "[&_span[role='img']]:shrink-0 [&_span[role='img']:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
};

export { SidebarMenuButton };
export {
  Sidebar as SidebarRoot,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@acme/ui/shadcn/sidebar";
