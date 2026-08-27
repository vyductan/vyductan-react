import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Editor } from "./editor";

const meta = {
  title: "Components/Editor/Block Format",
  component: Editor,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof Editor>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The trigger keeps every label mounted to reserve width, so `textContent` holds
 * all of them and `toHaveTextContent` would match whichever one was asked for.
 * Only the shown one counts — and the rest must be hidden from assistive tech
 * rather than merely painted over.
 */
function visibleLabelOf(trigger: HTMLElement) {
  // Leaf spans only, so this reads the label regardless of how they are wrapped
  // — otherwise a structural change makes the test fail for its own reasons
  // instead of for the width it guards.
  const labels = [...trigger.querySelectorAll<HTMLElement>("span")].filter(
    (node) => node.querySelector("span") === null,
  );
  const shown = labels.filter(
    (node) => node.getAttribute("aria-hidden") !== "true",
  );

  expect(shown).toHaveLength(1);

  for (const node of labels) {
    if (shown.includes(node)) continue;
    expect(globalThis.getComputedStyle(node).visibility).toBe("hidden");
  }

  return shown[0]?.textContent;
}

async function selectBlockType(canvasElement: HTMLElement, label: string) {
  const canvas = within(canvasElement);
  const trigger = await waitFor(() => canvas.getByRole("combobox"));

  await userEvent.click(trigger);

  // The listbox is portalled, so it is outside the canvas element.
  const option = await waitFor(() =>
    within(document.body).getByRole("option", { name: label }),
  );

  await userEvent.click(option);

  await waitFor(() => {
    expect(visibleLabelOf(trigger)).toBe(label);
  });

  return trigger;
}

/**
 * The trigger sits at the head of the toolbar, so sizing it to its own label
 * makes every button after it slide sideways whenever the caret moves between a
 * paragraph and a heading. Its width has to be the width of the longest label,
 * not of the current one.
 */
export const TriggerWidthSurvivesBlockChanges: Story = {
  // The fixed toolbar, which carries this dropdown, ships with `simple`.
  args: { variant: "simple" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The fixed toolbar mounts after the editor itself, so the trigger is not in
    // the first paint.
    const trigger = await waitFor(() => canvas.getByRole("combobox"));

    await waitFor(() => {
      expect(visibleLabelOf(trigger)).toBe("Paragraph");
    });

    const paragraphWidth = trigger.getBoundingClientRect().width;

    // "Numbered List" is the widest label on offer; "Paragraph" is mid-length.
    await selectBlockType(canvasElement, "Numbered List");
    const listWidth = trigger.getBoundingClientRect().width;

    await selectBlockType(canvasElement, "Heading 1");
    const headingWidth = trigger.getBoundingClientRect().width;

    expect(listWidth).toBe(paragraphWidth);
    expect(headingWidth).toBe(paragraphWidth);

    // Stability alone is satisfied by a trigger stretched across the toolbar, so
    // the size is pinned too: reserving the widest label must not turn into
    // reserving all of them.
    const toolbarRow = trigger.parentElement;
    expect(toolbarRow).not.toBeNull();
    expect(paragraphWidth).toBeLessThan(
      toolbarRow!.getBoundingClientRect().width * 0.5,
    );
  },
};
