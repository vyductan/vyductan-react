import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";

import { Modal } from "./modal";

/**
 * When a modal body is taller than `max-h-[80vh]` it scrolls. The thin Radix
 * scrollbar is easy to miss, so the Modal shows a soft **edge gradient** on the
 * side that still has hidden content — a passive "there's more this way" cue.
 *
 * - Theme-aware (dark shadow on light surfaces, light glow on dark).
 * - Painted as an **overlay above the content**, so it stays visible even over
 *   an opaque row (e.g. a highlighted total) — see the `OrderSummary` story.
 * - Self-hiding: no cue when the body fits, top-only at the bottom, etc.
 *
 * **Use it for** long modal bodies: order/invoice summaries, settings forms,
 * change logs, terms/policy text — anywhere the content can outgrow the modal.
 */
const meta = {
  title: "Components/Modal/ScrollAffordance",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Plain long body — the baseline case + the regression test for the cue. */
export const LongContentFades: Story = {
  render: () => (
    <Modal open title="Release notes">
      {Array.from({ length: 60 }, (_, i) => (
        <p key={i} data-testid={i === 0 ? "first-line" : undefined}>
          Line {i + 1} — lorem ipsum dolor sit amet consectetur.
        </p>
      ))}
    </Modal>
  ),
  play: async () => {
    const body = within(document.body);
    await waitFor(() => expect(body.queryByTestId("first-line")).not.toBeNull());

    const vp = document.querySelector<HTMLElement>(
      "[data-radix-scroll-area-viewport]",
    )!;
    // wrapper = scrollRef div: viewport → ScrollArea root → wrapper.
    const wrapper = vp.parentElement!.parentElement!;
    expect(vp.scrollHeight).toBeGreaterThan(vp.clientHeight);

    // At the top: only the bottom cue (more below), not the top cue.
    await waitFor(() =>
      expect(wrapper.hasAttribute("data-scroll-down")).toBe(true),
    );
    expect(wrapper.hasAttribute("data-scroll-up")).toBe(false);

    // Scroll to the bottom: cues flip.
    vp.scrollTop = vp.scrollHeight;
    vp.dispatchEvent(new Event("scroll"));
    await waitFor(() =>
      expect(wrapper.hasAttribute("data-scroll-up")).toBe(true),
    );
    expect(wrapper.hasAttribute("data-scroll-down")).toBe(false);
  },
};

/**
 * Totals / summary modal. The **Total** row has its own opaque background — the
 * bug this guards against is that an inset shadow would paint *under* it and get
 * hidden. The overlay cue sits on top, so it still reads over the total row.
 */
export const OrderSummary: Story = {
  render: () => (
    <Modal
      open
      title="Order summary"
      okText="Confirm"
      okButtonProps={{ color: "primary" }}
    >
      <div className="space-y-1">
        {Array.from({ length: 30 }, (_, i) => (
          <div key={i} className="flex justify-between py-1">
            <span className="text-muted-foreground">Item {i + 1}</span>
            <span>${(i + 1) * 3.5}0</span>
          </div>
        ))}
        <div className="flex justify-between border-t pt-2">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">$633.00</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax (10%)</span>
          <span className="font-medium">$63.30</span>
        </div>
        <div
          data-testid="total-row"
          className="bg-muted -mx-1 flex justify-between rounded-md px-3 py-2"
        >
          <span className="font-semibold">Total Amount</span>
          <span className="text-primary font-semibold">$696.30</span>
        </div>
      </div>
    </Modal>
  ),
  play: async () => {
    const body = within(document.body);
    await waitFor(() => expect(body.queryByTestId("total-row")).not.toBeNull());

    const vp = document.querySelector<HTMLElement>(
      "[data-radix-scroll-area-viewport]",
    )!;
    const wrapper = vp.parentElement!.parentElement!;

    // The bottom cue is shown, and it is a LATER DOM sibling than the scroll
    // area → it paints on top of the (opaque) total row, not under it.
    await waitFor(() =>
      expect(wrapper.hasAttribute("data-scroll-down")).toBe(true),
    );
    const overlays = wrapper.querySelectorAll(":scope > [aria-hidden]");
    expect(overlays.length).toBe(2);
    expect(
      wrapper.lastElementChild === overlays[overlays.length - 1],
    ).toBe(true);
  },
};

/**
 * Long policy text that the user must scroll through before confirming — the
 * case where the affordance matters most (the Confirm button sits below the
 * fold, so the cue tells the user there's more to read).
 */
export const TermsToAccept: Story = {
  render: () => (
    <Modal open title="Terms of Service" okText="I agree" cancelText="Decline">
      <div className="space-y-3 text-sm leading-relaxed">
        {Array.from({ length: 14 }, (_, i) => (
          <p key={i}>
            {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            Ut enim ad minim veniam, quis nostrud exercitation ullamco.
          </p>
        ))}
      </div>
    </Modal>
  ),
};
