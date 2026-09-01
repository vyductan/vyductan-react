import type { Meta, StoryObj } from "@storybook/react-vite";
import type * as React from "react";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Button } from "../button";
import { Drawer } from "../drawer";
import { Select } from "../select";

import { ComponentSource } from "../mdx/component-source";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";
import BasicExample from "./examples/basic";
import BasicShadcnLikeExample from "./examples/basic-shadcn-like";
import DefaultSpacingExample from "./examples/default-spacing";
import { Popover } from "./popover";

const meta = {
  title: "Components/Popover",
  component: Popover,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    trigger: {
      control: { type: "radio" },
      options: ["click", "hover", "focus"],
    },
    arrow: {
      control: { type: "boolean" },
    },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;
type ExampleStory = Pick<Story, "render">;

function CompareTabs({
  antLikeSrc,
  antLikeComp,
  shadcnLikeSrc,
  shadcnLikeComp,
}: {
  antLikeSrc: string;
  antLikeComp: React.FC;
  shadcnLikeSrc: string;
  shadcnLikeComp: React.FC;
}): React.JSX.Element {
  return (
    <div className="mx-auto w-full sm:w-3xl">
      <Tabs defaultValue="standard-api" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="standard-api">Standard API</TabsTrigger>
          <TabsTrigger value="composable-api">Composable API</TabsTrigger>
        </TabsList>
        <TabsContent value="standard-api">
          <ComponentSource src={antLikeSrc} __comp__={antLikeComp} />
        </TabsContent>
        <TabsContent value="composable-api">
          <ComponentSource src={shadcnLikeSrc} __comp__={shadcnLikeComp} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const Basic: ExampleStory = {
  render: () => (
    <CompareTabs
      antLikeSrc="popover/examples/basic.tsx"
      antLikeComp={BasicExample}
      shadcnLikeSrc="popover/examples/basic-shadcn-like.tsx"
      shadcnLikeComp={BasicShadcnLikeExample}
    />
  ),
};

export const DefaultSpacing: ExampleStory = {
  render: () => (
    <ComponentSource
      src="popover/examples/default-spacing.tsx"
      __comp__={DefaultSpacingExample}
    />
  ),
};

/**
 * The nlabs "Assign Guide to Job" flow, reduced: a list Popover opens a Drawer,
 * and every click the Drawer handles reaches the Popover as an outside
 * pointer-down. Without the guard in PopoverContent the list is dismissed the
 * moment the Drawer takes over, forcing the operator to reopen it per job.
 *
 * jsdom cannot exercise this — radix's outside-pointer handler does not fire
 * there — so this is the only real proof the guard works.
 */
export const SurvivesADrawerOpenedOnTop: Story = {
  render: () => {
    const DrawerFromPopover = () => {
      const [drawerOpen, setDrawerOpen] = useState(false);

      return (
        <>
          <Popover
            trigger="click"
            content={
              <Button onClick={() => setDrawerOpen(true)}>Assign job</Button>
            }
          >
            <Button>Open jobs list</Button>
          </Popover>
          <Drawer
            open={drawerOpen}
            title="Assign Guide to Job"
            onClose={() => setDrawerOpen(false)}
          >
            <Button>A control inside the drawer</Button>
          </Drawer>
        </>
      );
    };

    return <DrawerFromPopover />;
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const popoverNode = () =>
      document.querySelector("[data-slot='popover-content']");

    await step("open the jobs list popover", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /open jobs/i }));
      await waitFor(() =>
        expect(body.getByRole("button", { name: /assign job/i })).toBeVisible(),
      );
    });

    await step("open the drawer from inside the popover", async () => {
      await userEvent.click(body.getByRole("button", { name: /assign job/i }));
      await waitFor(() =>
        expect(body.getByText("Assign Guide to Job")).toBeVisible(),
      );
    });

    await step("clicking inside the drawer leaves the popover standing", async () => {
      await userEvent.click(
        body.getByRole("button", { name: /a control inside the drawer/i }),
      );

      // Presence, not role: the drawer is modal, so radix marks everything
      // outside it `aria-hidden` — the popover is intentionally out of the
      // accessibility tree while the drawer is up, but must not be dismissed.
      expect(popoverNode()).not.toBeNull();
    });

    await step("and it comes back to life once the drawer closes", async () => {
      await userEvent.click(body.getByRole("button", { name: "Close" }));
      await waitFor(() =>
        expect(body.queryByText("Assign Guide to Job")).toBeNull(),
      );
      await waitFor(() =>
        expect(body.getByRole("button", { name: /assign job/i })).toBeVisible(),
      );
    });

    // Escape while the popover is parked: the popover's layer registered first,
    // so its dismiss runs first — and Radix's escape handler marks the keydown
    // `defaultPrevented` when it dismisses, which the drawer's own (separate)
    // stack reads as "already handled" and skips.
    await step("Escape closes the drawer, not the parked popover", async () => {
      await userEvent.click(body.getByRole("button", { name: /assign job/i }));
      await waitFor(() =>
        expect(body.getByText("Assign Guide to Job")).toBeVisible(),
      );

      await userEvent.keyboard("{Escape}");

      await waitFor(() =>
        expect(body.queryByText("Assign Guide to Job")).toBeNull(),
      );
      expect(popoverNode()?.getAttribute("data-state")).toBe("open");
    });

    // The click that DISMISSES the drawer is the hard case: that same event is
    // an outside pointer-down for the popover, and the drawer flips its own
    // data-state while handling it.
    await step("surviving the click that dismisses the drawer", async () => {
      await userEvent.click(body.getByRole("button", { name: /assign job/i }));
      await waitFor(() =>
        expect(body.getByText("Assign Guide to Job")).toBeVisible(),
      );

      const overlay = document.querySelector("[data-slot='drawer-overlay']");
      expect(overlay).not.toBeNull();
      await userEvent.click(overlay as Element);

      await waitFor(() =>
        expect(body.queryByText("Assign Guide to Job")).toBeNull(),
      );
      await waitFor(() =>
        expect(body.getByRole("button", { name: /assign job/i })).toBeVisible(),
      );
    });
  },
};

/**
 * Their three-layer shape: a jobs-list Popover parked BEHIND the drawer, plus a
 * Popover opened INSIDE the drawer, plus a Select in that inner popover. Escape
 * must peel one layer per press — select, inner popover, drawer — and leave the
 * parked list for last.
 */
export const EscapePeelsNestedLayersOneAtATime: Story = {
  render: () => {
    const ThreeLayers = () => {
      const [drawerOpen, setDrawerOpen] = useState(false);

      return (
        <>
          <Popover
            trigger="click"
            content={
              <Button onClick={() => setDrawerOpen(true)}>Assign job</Button>
            }
          >
            <Button>Open jobs list</Button>
          </Popover>
          <Drawer
            open={drawerOpen}
            title="Assign Guide to Job"
            onClose={() => setDrawerOpen(false)}
          >
            <Popover
              trigger="click"
              content={
                <Select
                  placeholder="Pick one"
                  options={[
                    { label: "First", value: "1" },
                    { label: "Second", value: "2" },
                  ]}
                />
              }
            >
              <Button>Open inner popover</Button>
            </Popover>
          </Drawer>
        </>
      );
    };

    return <ThreeLayers />;
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const openSlots = () =>
      [...document.querySelectorAll("[data-state='open']")]
        .map((n) => n.getAttribute("data-slot"))
        .filter((slot) => slot?.endsWith("content"));

    await step("stack all four layers", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /open jobs/i }));
      await userEvent.click(body.getByRole("button", { name: /assign job/i }));
      await waitFor(() =>
        expect(body.getByText("Assign Guide to Job")).toBeVisible(),
      );
      await userEvent.click(
        body.getByRole("button", { name: /open inner popover/i }),
      );
      const selectTrigger = await waitFor(() => {
        const node = document.querySelector("[data-slot='select-trigger']");
        expect(node).not.toBeNull();
        return node as Element;
      });
      await userEvent.click(selectTrigger);
      await waitFor(() =>
        expect(openSlots()).toContain("select-content"),
      );
    });

    await step("Escape #1 takes the select only", async () => {
      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(openSlots()).not.toContain("select-content"));
      expect(body.queryByText("Assign Guide to Job")).not.toBeNull();
    });

    // Deliberately pressed while the closed select node is STILL MOUNTED (it
    // keeps its layer registration until its exit animation ends — measured at
    // ~150ms here, reported as indefinite in one app). Radix would hand this
    // Escape to that dying layer and leave everything beneath it deaf; the
    // registry in lib/modal-layers routes on the topmost OPEN layer instead.
    await step("Escape #2 takes the in-drawer popover only", async () => {
      expect(
        document.querySelector("[data-slot='select-content']"),
      ).not.toBeNull();

      await userEvent.keyboard("{Escape}");
      await waitFor(() =>
        expect(
          openSlots().filter((slot) => slot === "popover-content"),
        ).toHaveLength(1),
      );
      expect(body.queryByText("Assign Guide to Job")).not.toBeNull();
    });

    await step("Escape #3 takes the drawer, parked list survives", async () => {
      await userEvent.keyboard("{Escape}");
      await waitFor(() =>
        expect(body.queryByText("Assign Guide to Job")).toBeNull(),
      );
      expect(openSlots()).toContain("popover-content");
    });
  },
};
