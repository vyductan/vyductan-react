"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@acme/ui/shadcn/sidebar";

type ExampleItem = {
  key: string;
  label: string;
};

const exampleItems: ExampleItem[] = [
  {
    key: "/examples/alert",
    label: "Alert",
  },
  {
    key: "/examples/alert-modal",
    label: "Alert Modal",
  },
  {
    key: "/examples/button",
    label: "Button",
  },
  {
    key: "/examples/checkbox",
    label: "Checkbox",
  },
  {
    key: "/examples/color-picker",
    label: "Color Picker",
  },
  {
    key: "/examples/date-range-picker",
    label: "Date Range Picker",
  },
  {
    key: "/examples/descriptions",
    label: "Descriptions",
  },
  {
    key: "/examples/divider",
    label: "Divider",
  },
  {
    key: "/examples/editor",
    label: "Editor",
  },
  {
    key: "/examples/empty",
    label: "Empty",
  },
  {
    key: "/examples/form",
    label: "Form",
  },
  {
    key: "/examples/list",
    label: "List",
  },
  {
    key: "/examples/progress",
    label: "Progress",
  },
  {
    key: "/examples/radio",
    label: "Radio",
  },
  {
    key: "/examples/result",
    label: "Result",
  },
  {
    key: "/examples/select",
    label: "Select",
  },
  {
    key: "/examples/space",
    label: "Space",
  },
  {
    key: "/examples/table",
    label: "Table",
  },
  {
    key: "/examples/tabs",
    label: "Tabs",
  },
];

export default function ExamplesLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className="px-4 py-2">
              <h2 className="text-lg font-semibold">Examples</h2>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {exampleItems.map((item) => {
                const isActive = pathname === item.key.toString();
                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.key.toString()}>{item.label}</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="flex-1">
          <div className="bg-background min-h-screen">
            <div className="container mx-auto pl-6">{children}</div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
