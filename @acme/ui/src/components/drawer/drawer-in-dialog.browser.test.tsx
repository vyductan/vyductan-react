import { useState } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test } from "vitest";

import { AutoComplete } from "../auto-complete";
import { Dialog, DialogContent } from "../modal/_components";
import { Drawer } from "./drawer";

/**
 * A Drawer raised from inside an open Dialog has to stay typeable.
 *
 * Two focus traps are live at once here, and they only cooperate while both
 * come from the SAME copy of @radix-ui/react-focus-scope — `focusScopesStack`
 * is module-level state, so a scope pauses the one beneath it only within its
 * own module instance. Our Dialog resolves that package through `radix-ui` and
 * our Drawer through `vaul`'s own @radix-ui/react-dialog; when those resolved
 * to different versions the Dialog never paused, and its `focusin` handler ran
 * `focus(lastFocusedElement)` on every click landing in the Drawer. Focus
 * snapped back to whatever was last focused in the Dialog and no input in the
 * Drawer could be typed into. The pin lives in `overrides` in
 * pnpm-workspace.yaml.
 *
 * THIS CANNOT BE A JSDOM TEST. Checked: the jsdom version of the AutoComplete
 * case below passes against the broken dependency tree — a false pass, the same
 * reason the `touch` project exists. Only a real browser schedules the focus
 * events faithfully enough to show the steal.
 *
 * Scope: this guards the MECHANISM, not one screen. It was cross-checked once
 * against the real thing — the actual SelectGuideColumn from the operator
 * dashboard, rendered in this same Dialog + Drawer with tRPC stubbed — which
 * failed and passed in exactly the same two conditions. That version is not
 * kept: it needed hand-written fixtures for every field the guide cards read,
 * which drift for reasons that have nothing to do with focus.
 */
// Browser mode has no auto-cleanup, and these render portalled layers that
// otherwise survive into the next test.
afterEach(cleanup);

const GUIDES = [
  { value: "g1", display: "Shuhei Kasahara", label: "Shuhei Kasahara" },
  { value: "g2", display: "Harry Guide", label: "Harry Guide" },
];

function PickAGuide() {
  const [value, setValue] = useState<string>("");

  return (
    <AutoComplete
      mode="input"
      allowClear
      value={value}
      optionLabelProp="display"
      onChange={(next) => setValue(next ?? "")}
      placeholder="Search by Name or Code..."
      options={GUIDES}
      optionsToSearch={GUIDES.map((g) => ({ value: g.value, label: g.label }))}
    />
  );
}

/**
 * The Stock board's shape: Tour Details is already open, and "Assign guide"
 * raises the drawer on top of it. The button matters — it is what the Dialog's
 * focus scope remembers, and so what focus snapped back to.
 */
function TourDetailsWithAssignGuideDrawer({
  children,
}: {
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <Dialog open>
      <DialogContent>
        <p>tour details</p>
        <button type="button" onClick={() => setDrawerOpen(true)}>
          Assign guide
        </button>
        <Drawer open={drawerOpen} title="Assign Guide to Job">
          {children}
        </Drawer>
      </DialogContent>
    </Dialog>
  );
}

describe("a Drawer raised from inside an open Dialog", () => {
  test("a plain input in the drawer keeps focus and takes typing", async () => {
    const user = userEvent.setup();
    render(
      <TourDetailsWithAssignGuideDrawer>
        <input aria-label="notes" />
      </TourDetailsWithAssignGuideDrawer>,
    );

    await user.click(await screen.findByText("Assign guide"));

    const input = await screen.findByLabelText("notes");
    await user.click(input);
    expect(input).toHaveFocus();

    await user.keyboard("hello");
    expect(input).toHaveValue("hello");
  });

  test("the 'Pick a guide' AutoComplete takes typing and lists matches", async () => {
    const user = userEvent.setup();
    render(
      <TourDetailsWithAssignGuideDrawer>
        <PickAGuide />
      </TourDetailsWithAssignGuideDrawer>,
    );

    await user.click(await screen.findByText("Assign guide"));

    const input = await screen.findByPlaceholderText(
      "Search by Name or Code...",
    );
    await user.click(input);
    expect(input).toHaveFocus();

    await user.keyboard("shuhei");
    expect(input).toHaveValue("shuhei");

    // The panel is focus-triggered, so a stolen focus also means no dropdown.
    expect(await screen.findByText("Shuhei Kasahara")).toBeVisible();
    expect(screen.queryByText("Harry Guide")).not.toBeInTheDocument();
  });
});
