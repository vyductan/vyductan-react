import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ArrowRight, Bell, Settings } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@acme/ui/components/card";

import { Button } from "../button";

const meta = {
  title: "Components/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the card content area where you can place any content.</p>
      </CardContent>
    </Card>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>You have 3 unread messages</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <Bell className="size-5" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">New messages</p>
            <p className="text-muted-foreground text-sm">
              Check your inbox for updates
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outlined">Dismiss</Button>
        <Button>View All</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithImage: Story = {
  render: () => (
    <Card className="w-[350px] overflow-hidden">
      <div className="h-[200px] bg-linear-to-br from-blue-400 to-purple-500" />
      <CardHeader>
        <CardTitle>Beautiful Gradient</CardTitle>
        <CardDescription>A card with a cover image</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          This card demonstrates how to include images or visual elements at the
          top.
        </p>
      </CardContent>
    </Card>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Card className="w-[350px] cursor-pointer transition-all hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Settings
          <Settings className="text-muted-foreground size-5" />
        </CardTitle>
        <CardDescription>Manage your account settings</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          Click to view and update your preferences
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="text" className="ml-auto">
          Open <ArrowRight className="ml-2 size-4" />
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const GridLayout: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Total Revenue</CardTitle>
          <CardDescription>+20.1% from last month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$45,231.89</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Subscriptions</CardTitle>
          <CardDescription>+180.1% from last month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+2,350</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Sales</CardTitle>
          <CardDescription>+19% from last month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+12,234</div>
        </CardContent>
      </Card>
    </div>
  ),
};

export const MinimalContent: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardContent className="pt-6">
        <p className="text-muted-foreground text-sm">
          A simple card with just content, no header or footer.
        </p>
      </CardContent>
    </Card>
  ),
};
