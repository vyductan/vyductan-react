import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { Editor } from "./editor";
import { MIN_COLUMN_WIDTH } from "./plugins/table-column-resize-model";
import { editorRenderFixtures } from "./render/render-fixtures";

const meta = {
  title: "Components/Editor/Column Resize",
  component: Editor,
  parameters: { layout: "padded" },
  args: {
    value: editorRenderFixtures.table.serialized,
    variant: "simple" as const,
    autoFocus: false,
    onChange: fn(),
  },
} satisfies Meta<typeof Editor>;

export default meta;
type Story = StoryObj<typeof meta>;

async function tableOf(canvasElement: HTMLElement) {
  return await waitFor(() => {
    const table = canvasElement.querySelector("table");
    if (!(table instanceof HTMLTableElement)) {
      throw new Error("table never rendered");
    }
    return table;
  });
}

/** Park the pointer on a column's right edge and hand back the grabber. */
async function grabBoundary(
  canvasElement: HTMLElement,
  table: HTMLTableElement,
  columnIndex: number,
) {
  const cell = table.rows[0]?.cells[columnIndex];
  if (!cell) throw new Error(`no cell at column ${columnIndex}`);

  const box = cell.getBoundingClientRect();
  await userEvent.pointer({
    target: cell,
    coords: { clientX: box.right, clientY: box.top + box.height / 2 },
  });

  return await waitFor(() => {
    const grabber = canvasElement.querySelector<HTMLElement>(
      "[data-table-column-resizer]",
    );
    if (!grabber) throw new Error("grabber never appeared");
    return grabber;
  });
}

const widthsOf = (table: HTMLTableElement) =>
  [...(table.rows[0]?.cells ?? [])].map(
    (cell) => cell.getBoundingClientRect().width,
  );

export const ResizerAppearsOnColumnBoundaryHover: Story = {
  play: async ({ canvasElement }) => {
    const table = await tableOf(canvasElement);
    const grabber = await grabBoundary(canvasElement, table, 0);

    expect(grabber.dataset["tableColumnIndex"]).toBe("0");

    const cellRight = table.rows[0]!.cells[0]!.getBoundingClientRect().right;
    const grabberBox = grabber.getBoundingClientRect();

    expect(
      Math.abs(grabberBox.left + grabberBox.width / 2 - cellRight),
    ).toBeLessThan(2);
  },
};

/**
 * The first drag has to materialise the widths the browser is already using.
 * `border-collapse: collapse` shares adjacent borders, so a naive
 * sum-of-cell-widths measurement overshoots by one border per seam and the table
 * visibly grows the instant it is sized.
 */
export const FirstDragDoesNotJumpTheTable: Story = {
  play: async ({ canvasElement }) => {
    const table = await tableOf(canvasElement);
    const before = widthsOf(table);
    const tableWidthBefore = table.getBoundingClientRect().width;

    expect(table.querySelector("colgroup")).toBeNull();

    const grabber = await grabBoundary(canvasElement, table, 0);
    const box = grabber.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;

    await userEvent.pointer([
      {
        keys: "[MouseLeft>]",
        target: grabber,
        coords: { clientX: x, clientY: y },
      },
      {
        keys: "[/MouseLeft]",
        target: grabber,
        coords: { clientX: x, clientY: y },
      },
    ]);

    await waitFor(() => {
      expect(table.querySelectorAll("colgroup > col")).toHaveLength(
        before.length,
      );
    });

    for (const [index, width] of widthsOf(table).entries()) {
      expect(Math.abs(width - before[index]!)).toBeLessThan(1.5);
    }
    expect(
      Math.abs(table.getBoundingClientRect().width - tableWidthBefore),
    ).toBeLessThan(1.5);
  },
};

export const DragWidensOnlyThatColumn: Story = {
  play: async ({ args, canvasElement }) => {
    const table = await tableOf(canvasElement);
    const before = widthsOf(table);

    const grabber = await grabBoundary(canvasElement, table, 0);
    const box = grabber.getBoundingClientRect();
    const y = box.top + box.height / 2;
    const startX = box.left + box.width / 2;

    await userEvent.pointer([
      {
        keys: "[MouseLeft>]",
        target: grabber,
        coords: { clientX: startX, clientY: y },
      },
      { target: grabber, coords: { clientX: startX + 80, clientY: y } },
      {
        keys: "[/MouseLeft]",
        target: grabber,
        coords: { clientX: startX + 80, clientY: y },
      },
    ]);

    await waitFor(() => {
      expect(widthsOf(table)[0]! - before[0]!).toBeGreaterThan(70);
    });

    const after = widthsOf(table);
    expect(after[0]! - before[0]!).toBeLessThan(90);
    // Only the dragged column moves; the table grows instead.
    expect(Math.abs(after[1]! - before[1]!)).toBeLessThan(2);

    // The commit reaches the serialized value, not just the DOM.
    await waitFor(() => {
      const calls = (args.onChange as ReturnType<typeof fn>).mock.calls;
      const last = calls.at(-1)?.[0] as string | undefined;
      if (!last) throw new Error("editor never reported a change");
      const parsed = JSON.parse(last) as {
        root: { children: { type: string; colWidths?: number[] }[] };
      };
      const tableJson = parsed.root.children.find((c) => c.type === "table");
      expect(tableJson?.colWidths?.[0]).toBeGreaterThan(before[0]! + 70);
    });
  },
};

export const MinWidthIsClamped: Story = {
  play: async ({ canvasElement }) => {
    const table = await tableOf(canvasElement);
    const grabber = await grabBoundary(canvasElement, table, 0);
    const box = grabber.getBoundingClientRect();
    const y = box.top + box.height / 2;
    const startX = box.left + box.width / 2;

    await userEvent.pointer([
      {
        keys: "[MouseLeft>]",
        target: grabber,
        coords: { clientX: startX, clientY: y },
      },
      { target: grabber, coords: { clientX: startX - 500, clientY: y } },
      {
        keys: "[/MouseLeft]",
        target: grabber,
        coords: { clientX: startX - 500, clientY: y },
      },
    ]);

    // MIN_COLUMN_WIDTH matches the CSS floor on BOTH cell classes, so the
    // stored value and the rendered width agree instead of fighting.
    await waitFor(() => {
      expect(widthsOf(table)[0]).toBeGreaterThan(MIN_COLUMN_WIDTH - 3);
      expect(widthsOf(table)[0]).toBeLessThan(MIN_COLUMN_WIDTH + 3);
    });
  },
};

export const EscapeCancelsTheResize: Story = {
  play: async ({ canvasElement }) => {
    const table = await tableOf(canvasElement);
    const before = widthsOf(table);

    const grabber = await grabBoundary(canvasElement, table, 0);
    const box = grabber.getBoundingClientRect();
    const y = box.top + box.height / 2;
    const startX = box.left + box.width / 2;

    await userEvent.pointer([
      {
        keys: "[MouseLeft>]",
        target: grabber,
        coords: { clientX: startX, clientY: y },
      },
      { target: grabber, coords: { clientX: startX + 80, clientY: y } },
    ]);

    await waitFor(() => {
      expect(widthsOf(table)[0]! - before[0]!).toBeGreaterThan(70);
    });

    await userEvent.keyboard("{Escape}");

    await waitFor(() => {
      expect(Math.abs(widthsOf(table)[0]! - before[0]!)).toBeLessThan(2);
    });
  },
};

/**
 * The grabber is portalled outside the `<table>`, so a pointer that reaches it
 * no longer resolves to a cell. Hiding on that would drop the grabber, put the
 * pointer back over the cell, raise it again — a flicker loop, and never a
 * stable `col-resize` target to actually grab.
 */
export const GrabberSurvivesHoveringItself: Story = {
  play: async ({ canvasElement }) => {
    const table = await tableOf(canvasElement);
    const grabber = await grabBoundary(canvasElement, table, 0);
    const box = grabber.getBoundingClientRect();

    await userEvent.pointer({
      target: grabber,
      coords: {
        clientX: box.left + box.width / 2,
        clientY: box.top + box.height / 2,
      },
    });

    // Still there, still the same boundary, and still showing a resize cursor.
    const stillThere = canvasElement.querySelector<HTMLElement>(
      "[data-table-column-resizer]",
    );
    expect(stillThere).not.toBeNull();
    expect(stillThere?.dataset["tableColumnIndex"]).toBe("0");
    expect(globalThis.getComputedStyle(stillThere!).cursor).toBe("col-resize");

    // Visible without needing a :hover rule — the strip only exists when the
    // pointer is already on the boundary.
    const mark = stillThere!.querySelector<HTMLElement>(
      "[data-table-column-resize-mark]",
    );
    expect(mark).not.toBeNull();
    const markBox = mark!.getBoundingClientRect();
    expect(markBox.width).toBeGreaterThan(0);
    expect(markBox.height).toBeGreaterThan(20);

    // And it has not moved out from under the pointer.
    const after = stillThere!.getBoundingClientRect();
    expect(Math.abs(after.left - box.left)).toBeLessThan(1);
  },
};

/**
 * The grabber is portalled outside the `contenteditable`, so stepping onto it
 * fires `mouseleave` on the editor root. Treating that as "pointer left the
 * table" tears the grabber down, which hands the pointer back to the cell and
 * raises it again — the flicker, arriving by a second route that hovering alone
 * does not exercise.
 */
export const GrabberSurvivesLeavingTheEditorRootForIt: Story = {
  play: async ({ canvasElement }) => {
    const table = await tableOf(canvasElement);
    const grabber = await grabBoundary(canvasElement, table, 0);

    const editorRoot = canvasElement.querySelector<HTMLElement>(
      '[contenteditable="true"]',
    );
    if (!editorRoot) throw new Error("no editor root");

    editorRoot.dispatchEvent(
      new MouseEvent("mouseleave", {
        bubbles: false,
        relatedTarget: grabber,
      }),
    );

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(
      canvasElement.querySelector("[data-table-column-resizer]"),
    ).not.toBeNull();
  },
};

/**
 * While dragging there is exactly one blue line, and it is the one under the
 * pointer. Leaving the resting mark painted at the old boundary as well reads as
 * the column having split in two.
 */
export const DraggingShowsASingleLine: Story = {
  play: async ({ canvasElement }) => {
    const table = await tableOf(canvasElement);
    const grabber = await grabBoundary(canvasElement, table, 0);
    const box = grabber.getBoundingClientRect();
    const y = box.top + box.height / 2;
    const startX = box.left + box.width / 2;

    await userEvent.pointer([
      {
        keys: "[MouseLeft>]",
        target: grabber,
        coords: { clientX: startX, clientY: y },
      },
      { target: grabber, coords: { clientX: startX + 60, clientY: y } },
    ]);

    const marks = canvasElement.querySelectorAll(
      "[data-table-column-resize-mark], [data-table-column-resize-ruler]",
    );
    const visible = [...marks].filter((mark) => {
      const rect = mark.getBoundingClientRect();
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        globalThis.getComputedStyle(mark).visibility !== "hidden" &&
        Number(globalThis.getComputedStyle(mark).opacity) > 0
      );
    });

    expect(visible).toHaveLength(1);

    // And the surviving one tracks the pointer, not the original boundary.
    const rect = visible[0]!.getBoundingClientRect();
    expect(Math.abs(rect.left + rect.width / 2 - (startX + 60))).toBeLessThan(
      3,
    );

    await userEvent.pointer({
      keys: "[/MouseLeft]",
      target: grabber,
      coords: { clientX: startX + 60, clientY: y },
    });
  },
};

/**
 * The line has to mark where the boundary will land, not where the pointer is.
 * Dragging past the clamp used to leave it drifting into the middle of the
 * column while the column itself refused to move.
 */
export const RulerStopsAtTheClamp: Story = {
  play: async ({ canvasElement }) => {
    const table = await tableOf(canvasElement);
    const before = widthsOf(table);
    const grabber = await grabBoundary(canvasElement, table, 0);
    const box = grabber.getBoundingClientRect();
    const y = box.top + box.height / 2;
    const startX = box.left + box.width / 2;

    await userEvent.pointer([
      {
        keys: "[MouseLeft>]",
        target: grabber,
        coords: { clientX: startX, clientY: y },
      },
      { target: grabber, coords: { clientX: startX - 400, clientY: y } },
    ]);

    const ruler = canvasElement.querySelector<HTMLElement>(
      "[data-table-column-resize-ruler]",
    );
    if (!ruler) throw new Error("ruler never appeared");

    // The column cannot shrink below its floor, so the line must sit on that
    // floor's boundary rather than 400px to the left with the pointer.
    const rulerX = ruler.getBoundingClientRect().left;
    const clampedBoundary =
      table.getBoundingClientRect().left + widthsOf(table)[0]!;

    expect(Math.abs(rulerX - clampedBoundary)).toBeLessThan(3);
    expect(rulerX).toBeGreaterThan(startX - 400 + 50);

    // The column stopped at the floor rather than following the pointer 400px
    // left — which is exactly why the ruler had to stop with it.
    expect(before[0]).toBeGreaterThan(MIN_COLUMN_WIDTH);
    expect(widthsOf(table)[0]).toBeGreaterThan(MIN_COLUMN_WIDTH - 3);
    expect(widthsOf(table)[0]).toBeLessThan(MIN_COLUMN_WIDTH + 3);

    await userEvent.pointer({
      keys: "[/MouseLeft]",
      target: grabber,
      coords: { clientX: startX - 400, clientY: y },
    });
  },
};

/**
 * Releasing the drag brings the resting mark back, and it has to come back on
 * the NEW boundary. The grabber's boundary was captured on hover, so reusing it
 * after a resize snapped the line back to where the column used to end — it only
 * corrected itself on the next pointer move.
 */
export const MarkReturnsToTheNewBoundary: Story = {
  play: async ({ canvasElement }) => {
    const table = await tableOf(canvasElement);
    const grabber = await grabBoundary(canvasElement, table, 0);
    const box = grabber.getBoundingClientRect();
    const y = box.top + box.height / 2;
    const startX = box.left + box.width / 2;

    await userEvent.pointer([
      {
        keys: "[MouseLeft>]",
        target: grabber,
        coords: { clientX: startX, clientY: y },
      },
      { target: grabber, coords: { clientX: startX + 80, clientY: y } },
      {
        keys: "[/MouseLeft]",
        target: grabber,
        coords: { clientX: startX + 80, clientY: y },
      },
    ]);

    // No further pointer movement: this is the state the user is left staring at.
    const mark = await waitFor(() => {
      const node = canvasElement.querySelector<HTMLElement>(
        "[data-table-column-resize-mark]",
      );
      if (!node) throw new Error("resting mark never came back");
      return node;
    });

    const markBox = mark.getBoundingClientRect();
    const newBoundary =
      table.getBoundingClientRect().left + widthsOf(table)[0]!;

    expect(
      Math.abs(markBox.left + markBox.width / 2 - newBoundary),
    ).toBeLessThan(3);
    // And emphatically not back where the column used to end.
    expect(Math.abs(markBox.left + markBox.width / 2 - startX)).toBeGreaterThan(
      40,
    );
  },
};

/**
 * Narrowing a column wraps its text and the table grows taller mid-drag. The
 * table's height was captured on hover, so the line kept the old height and
 * stopped short of the bottom of the table it was measuring.
 */
export const RulerGrowsWithTheTable: Story = {
  play: async ({ canvasElement }) => {
    const table = await tableOf(canvasElement);
    const heightBefore = table.getBoundingClientRect().height;

    const grabber = await grabBoundary(canvasElement, table, 0);
    const box = grabber.getBoundingClientRect();
    const y = box.top + box.height / 2;
    const startX = box.left + box.width / 2;

    await userEvent.pointer([
      {
        keys: "[MouseLeft>]",
        target: grabber,
        coords: { clientX: startX, clientY: y },
      },
      { target: grabber, coords: { clientX: startX - 400, clientY: y } },
    ]);

    const ruler = canvasElement.querySelector<HTMLElement>(
      "[data-table-column-resize-ruler]",
    );
    if (!ruler) throw new Error("ruler never appeared");

    const tableBox = table.getBoundingClientRect();

    // The drag has to actually have made the table taller, or this proves
    // nothing.
    expect(tableBox.height).toBeGreaterThan(heightBefore + 20);

    const rulerBox = ruler.getBoundingClientRect();
    expect(Math.abs(rulerBox.height - tableBox.height)).toBeLessThan(3);
    expect(Math.abs(rulerBox.top - tableBox.top)).toBeLessThan(3);

    await userEvent.pointer({
      keys: "[/MouseLeft]",
      target: grabber,
      coords: { clientX: startX - 400, clientY: y },
    });
  },
};
