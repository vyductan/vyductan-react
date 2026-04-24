import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ArrowRight, Bell, Settings } from "lucide-react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@acme/ui/components/card";

import { Button } from "../button";
import { Input } from "../input";
import { Label } from "../label";

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

export const Sizes: Story = {
  parameters: {
    layout: "padded",
  },
  render: () => (
    <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
      <div className="space-y-3">
        <p className="text-sm font-medium">Default</p>
        <Card className="mx-auto w-full max-w-sm">
          <CardHeader>
            <CardTitle>Default Card</CardTitle>
            <CardDescription>
              This card uses the default size variant.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Default spacing gives content more room.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outlined" className="w-full">
              Action
            </Button>
          </CardFooter>
        </Card>
      </div>
      <div className="space-y-3">
        <p className="text-sm font-medium">Small</p>
        <Card size="small" className="mx-auto w-full max-w-sm">
          <CardHeader>
            <CardTitle>Small Card</CardTitle>
            <CardDescription>
              This card uses the small size variant.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Compact spacing keeps the layout tighter.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outlined" className="w-full">
              Action
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
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

export const BorderedSections: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader className="border-b">
        <CardTitle>Account settings</CardTitle>
        <CardDescription>Manage your profile, security, and preferences.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm font-medium">Profile visibility</p>
          <p className="text-muted-foreground text-sm">
            Choose what other people can see on your public profile.
          </p>
        </div>
      </CardContent>
      <CardFooter className="border-t flex justify-between">
        <Button variant="outlined">Cancel</Button>
        <Button>Save changes</Button>
      </CardFooter>
    </Card>
  ),
};

export const ComposedClassNames: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "This story demonstrates that `classNames.*` still applies to `CardHeader` and `CardContent` when the card is composed manually with child slots, not only when using the shorthand title/description API.",
      },
    },
  },
  args: {
    classNames: {
      header: "bg-muted/30 ring-border rounded-b-none ring-1 ring-inset",
      content: "bg-primary/5 rounded-t-none",
    },
  },
  argTypes: {
    classNames: {
      control: "object",
    },
  },
  render: (args) => (
    <Card className="w-[350px]" classNames={args.classNames}>
      <CardHeader>
        <CardTitle>Composed slot overrides</CardTitle>
        <CardDescription>
          classNames.header and classNames.content still apply when you compose the slots manually.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          This story makes the overrides obvious so the composed API behavior is visible in Storybook.
        </p>
      </CardContent>
    </Card>
  ),
};

export const WithImage: Story = {
  render: () => (
    <Card className="relative mx-auto w-full max-w-sm">
      <figure className="relative z-20 aspect-video w-full overflow-hidden">
        <img
          alt="Event cover artwork"
          className="size-full object-cover brightness-60 grayscale dark:brightness-40"
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%231d4ed8'/%3E%3Cstop offset='100%25' stop-color='%237c3aed'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='450' fill='url(%23bg)'/%3E%3Ccircle cx='120' cy='90' r='60' fill='rgba(255,255,255,0.18)'/%3E%3Ccircle cx='690' cy='110' r='90' fill='rgba(255,255,255,0.12)'/%3E%3Crect x='72' y='286' width='196' height='16' rx='8' fill='rgba(255,255,255,0.82)'/%3E%3Crect x='72' y='314' width='312' height='12' rx='6' fill='rgba(255,255,255,0.58)'/%3E%3Crect x='72' y='338' width='248' height='12' rx='6' fill='rgba(255,255,255,0.42)'/%3E%3C/svg%3E"
        />
      </figure>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 aspect-video bg-black/35" />
      <CardHeader>
        <CardAction>
          <span className="bg-secondary text-secondary-foreground inline-flex h-5 w-fit shrink-0 items-center justify-center overflow-hidden rounded-4xl px-2 py-0.5 text-xs font-medium">
            Featured
          </span>
        </CardAction>
        <CardTitle>Design systems meetup</CardTitle>
        <CardDescription>
          A practical talk on component APIs, accessibility, and shipping
          faster.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button className="w-full">View Event</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithAction: Story = {
  parameters: {
    layout: "padded",
  },
  render: () => (
    <div className="w-full overflow-x-auto px-4 py-6">
      <div className="flex justify-center">
        <Card className="w-full max-w-sm min-w-sm">
          <CardHeader>
            <CardTitle>Login to your account</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
            <CardAction>
              <Button variant="link">Sign Up</Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <form id="login-form">
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </button>
                  </div>
                  <Input id="password" type="password" required />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button type="submit" form="login-form" className="w-full">
              Login
            </Button>
            <Button variant="outline" className="w-full">
              Login with Google
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Card className="w-[350px]">
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
