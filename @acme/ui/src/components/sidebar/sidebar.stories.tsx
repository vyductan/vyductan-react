import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  Calendar,
  ChevronUp,
  CreditCard,
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
} from "./_component";
import { Sidebar as SidebarBase } from "./index";
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

const drilldownItems = [
  {
    key: "/dashboard",
    label: "Dashboard",
    icon: <Home />,
    type: "item" as const,
  },
  {
    key: "/finance",
    label: "Finance",
    icon: <CreditCard />,
    type: "submenu" as const,
    children: [
      { key: "/finance", label: "Overview", type: "item" as const },
      { key: "/finance/budgets", label: "Budgets", type: "item" as const },
      {
        key: "/finance/settings",
        label: "Settings",
        icon: <Settings />,
        type: "submenu" as const,
        children: [
          {
            key: "/finance/settings/general",
            label: "General",
            type: "item" as const,
          },
          {
            key: "/finance/settings/members",
            label: "Members",
            type: "item" as const,
          },
        ],
      },
    ],
  },
  {
    key: "/calendar",
    label: "Calendar",
    icon: <Calendar />,
    type: "item" as const,
  },
];

export const Default: Story = {
  args: {
    items: items,
  },
};

/**
 * One level at a time, Vercel-style: activating a submenu swaps the list for
 * its children and prepends a back row naming the level you are inside.
 */
export const Drilldown: Story = {
  args: {
    items: drilldownItems,
    mode: "drilldown",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("drill into a submenu", async () => {
      await userEvent.click(canvas.getByText("Finance"));
      await expect(canvas.getByText("Budgets")).toBeVisible();
      await expect(canvas.queryByText("Dashboard")).not.toBeInTheDocument();
    });

    await step("drill a second level deeper", async () => {
      await userEvent.click(canvas.getByText("Settings"));
      await expect(canvas.getByText("Members")).toBeVisible();
    });

    await step("back walks the trail one level at a time", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: "Back to Settings" }),
      );
      await expect(canvas.getByText("Budgets")).toBeVisible();

      await userEvent.click(
        canvas.getByRole("button", { name: "Back to Finance" }),
      );
      await expect(canvas.getByText("Dashboard")).toBeVisible();
    });
  },
};

/**
 * The drill level follows the route: a `selectedKeys` deep in the tree opens
 * the branch that contains it, so a refresh or deep link lands on level 2.
 */
export const DrilldownSelectedDeepLink: Story = {
  args: {
    items: drilldownItems,
    mode: "drilldown",
    selectedKeys: ["/finance/budgets"],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Budgets")).toBeVisible();
    await expect(canvas.queryByText("Dashboard")).not.toBeInTheDocument();
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
    <SidebarBase className="w-64 border-r">
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
    </SidebarBase>
  ),
};
