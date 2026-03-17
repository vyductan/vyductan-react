import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Calendar,
  ChevronUp,
  Home,
  Inbox,
  Search,
  Settings,
  User2,
} from "lucide-react";

import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRoot,
} from "./_component";
import { Sidebar } from "./sidebar";

const meta = {
  title: "Components/Sidebar",
  component: Sidebar,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <Story />
        </div>
      </SidebarProvider>
    ),
  ],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

const items = [
  {
    key: "home",
    label: "Home",
    icon: <Home />,
    type: "item" as const,
  },
  {
    key: "inbox",
    label: "Inbox",
    icon: <Inbox />,
    type: "item" as const,
  },
  {
    key: "calendar",
    label: "Calendar",
    icon: <Calendar />,
    type: "item" as const,
  },
  {
    key: "search",
    label: "Search",
    icon: <Search />,
    type: "item" as const,
  },
  {
    key: "settings",
    label: "Settings",
    icon: <Settings />,
    type: "item" as const,
  },
];

const groupedItems = [
  {
    type: "group" as const,
    label: "Application",
    children: [
      {
        key: "home",
        label: "Home",
        icon: <Home />,
        type: "item" as const,
      },
      {
        key: "calendar",
        label: "Calendar",
        icon: <Calendar />,
        type: "item" as const,
      },
    ],
  },
  {
    type: "group" as const,
    label: "Settings",
    children: [
      {
        key: "settings",
        label: "General Settings",
        icon: <Settings />,
        type: "item" as const,
      },
    ],
  },
];

export const Default: Story = {
  args: {
    items: items,
  },
};

export const Grouped: Story = {
  args: {
    items: groupedItems,
  },
};

export const WithHeaderAndFooter: Story = {
  args: {
    items: items,
    header: (
      <div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm">
        <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
          <div className="size-4 rounded-full bg-current" />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-semibold">Acme Inc</span>
          <span className="truncate text-xs">Enterprise</span>
        </div>
      </div>
    ),
    footer: (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton>
            <User2 /> Username
            <ChevronUp className="ml-auto" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    ),
  },
};

/**
 * This story demonstrates how to use the Sidebar components in a composable way,
 * similar to the standard shadcn/ui usage pattern.
 */
export const ShadcnComposable: Story = {
  render: () => (
    <SidebarRoot className="w-64 border-r">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <div className="size-4 rounded-full bg-current" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Acme Inc</span>
            <span className="truncate text-xs">Enterprise</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton asChild>
                    <a href="#">
                      {item.icon}
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <User2 /> Username
              <ChevronUp className="ml-auto" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </SidebarRoot>
  ),
};
