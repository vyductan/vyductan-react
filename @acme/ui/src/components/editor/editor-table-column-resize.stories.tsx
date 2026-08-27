import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  expect,
  fireEvent,
  fn,
  userEvent,
  waitFor,
  within,
} from "storybook/test";

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

/**
 * Reaching for the resize line must not dismiss the things around it. The
 * grabber is portalled outside the `contenteditable`, so every plugin that
 * resolves the pointer through `closest("td, th")` — or treats `mouseleave` on
 * the editor root as "pointer left the table" — tears its own affordance down
 * as the pointer arrives.
 */
export const NeighbouringAffordancesSurviveTheGrabber: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const table = await tableOf(canvasElement);
    const lastCell = [...(table.rows[0]?.cells ?? [])].at(-1);
    if (!lastCell) throw new Error("fixture needs a last cell");

    // Focus a cell so the row/column handles are up, and sit in the right
    // stripe so the add-column button is up too.
    fireEvent.mouseUp(lastCell);
    const cellBox = lastCell.getBoundingClientRect();
    await userEvent.pointer({
      target: lastCell,
      coords: {
        clientX: cellBox.right - 14,
        clientY: cellBox.top + cellBox.height / 2,
      },
    });

    await waitFor(() => {
      expect(canvas.getByRole("button", { name: /row actions/i })).toBeTruthy();
      expect(
        canvasElement.querySelector("[data-table-hover-btn]"),
      ).not.toBeNull();
    });

    // Now step onto the grabber on that same edge.
    await userEvent.pointer({
      target: lastCell,
      coords: {
        clientX: cellBox.right,
        clientY: cellBox.top + cellBox.height / 2,
      },
    });

    const grabber = await waitFor(() => {
      const node = canvasElement.querySelector<HTMLElement>(
        "[data-table-column-resizer]",
      );
      if (!node) throw new Error("grabber never appeared");
      return node;
    });

    const grabberBox = grabber.getBoundingClientRect();
    await userEvent.pointer({
      target: grabber,
      coords: {
        clientX: grabberBox.left + grabberBox.width / 2,
        clientY: grabberBox.top + grabberBox.height / 2,
      },
    });

    // mouseleave on the editor root is dispatched with the grabber as the
    // relatedTarget, which is what actually happens when the pointer crosses.
    const editorRoot = canvasElement.querySelector<HTMLElement>(
      '[contenteditable="true"]',
    );
    editorRoot?.dispatchEvent(
      new MouseEvent("mouseleave", { bubbles: false, relatedTarget: grabber }),
    );

    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(
      canvas.queryByRole("button", { name: /row actions/i }),
    ).not.toBeNull();
    expect(
      canvas.queryByRole("button", { name: /column actions/i }),
    ).not.toBeNull();
    expect(
      canvasElement.querySelector("[data-table-hover-btn]"),
    ).not.toBeNull();
  },
};

/**
 * Notion hides the add-row/add-column affordance while you type. Ours stayed
 * parked at the coordinates it was measured at, so it sat in the middle of the
 * text as the cell grew.
 */
export const AddButtonHidesWhileTyping: Story = {
  play: async ({ canvasElement }) => {
    const table = await tableOf(canvasElement);
    const lastRow = [...table.rows].at(-1);
    const lastCell = [...(lastRow?.cells ?? [])].at(-1);
    if (!lastCell) throw new Error("fixture needs a last cell");

    // Click inside the bottom hover stripe: that places the caret in the cell
    // AND leaves the pointer where the add-row button is live, which is the
    // situation the bug needs — the pointer never moves again, so nothing but
    // the keystroke itself can take the button down.
    const cellBox = lastCell.getBoundingClientRect();
    const coords = {
      clientX: cellBox.left + 20,
      clientY: cellBox.bottom - 6,
    };
    await userEvent.pointer([
      { target: lastCell, coords },
      { keys: "[MouseLeft]", target: lastCell, coords },
    ]);

    await waitFor(() => {
      expect(
        canvasElement.querySelector("[data-table-hover-btn]"),
      ).not.toBeNull();
    });

    await userEvent.keyboard("typing");

    await waitFor(() => {
      expect(canvasElement.querySelector("[data-table-hover-btn]")).toBeNull();
    });
  },
};

/**
 * Hovering the grabber keeps the add-column button (the pointer is still working
 * on the table); pressing it must take the button down, and it has to stay down
 * for the whole drag. Pointer capture means every mousemove during a drag
 * targets the grabber, which the hover plugin reads as "still on an affordance"
 * — so without an explicit drag signal the button sat parked over the table
 * being resized.
 */
export const AddButtonHidesWhileDraggingTheGrabber: Story = {
  play: async ({ canvasElement }) => {
    const table = await tableOf(canvasElement);
    const lastCell = [...(table.rows[0]?.cells ?? [])].at(-1);
    if (!lastCell) throw new Error("fixture needs a last cell");

    const cellBox = lastCell.getBoundingClientRect();
    const midY = cellBox.top + cellBox.height / 2;
    const addButton = () =>
      canvasElement.querySelector("[data-table-hover-btn]");

    // The table's right edge is both the add-column stripe and a resize
    // boundary, so one spot raises both affordances.
    await userEvent.pointer({
      target: lastCell,
      coords: { clientX: cellBox.right - 14, clientY: midY },
    });
    await waitFor(() => {
      expect(addButton()).not.toBeNull();
    });

    await userEvent.pointer({
      target: lastCell,
      coords: { clientX: cellBox.right, clientY: midY },
    });
    const grabber = await waitFor(() => {
      const node = canvasElement.querySelector<HTMLElement>(
        "[data-table-column-resizer]",
      );
      if (!node) throw new Error("grabber never appeared");
      return node;
    });

    // Hovering it is not pressing it.
    expect(addButton()).not.toBeNull();

    const grabberBox = grabber.getBoundingClientRect();
    const x = grabberBox.left + grabberBox.width / 2;
    const y = grabberBox.top + grabberBox.height / 2;

    await userEvent.pointer({
      keys: "[MouseLeft>]",
      target: grabber,
      coords: { clientX: x, clientY: y },
    });
    await waitFor(() => {
      expect(addButton()).toBeNull();
    });

    // Still hidden across the whole drag, including where the pointer travels
    // over other cells and off the table entirely — the points where a plugin
    // that re-measures on mousemove would put the button back.
    const firstCell = table.rows[0]?.cells[0];
    for (const point of [
      { clientX: x - 40, clientY: y },
      firstCell
        ? (() => {
            const box = firstCell.getBoundingClientRect();
            return {
              clientX: box.left + box.width / 2,
              clientY: box.top + box.height / 2,
            };
          })()
        : { clientX: x - 80, clientY: y },
      { clientX: table.getBoundingClientRect().left - 60, clientY: y },
      { clientX: x - 20, clientY: table.getBoundingClientRect().bottom + 20 },
    ]) {
      await userEvent.pointer({ target: grabber, coords: point });
      expect(addButton()).toBeNull();
    }

    // Deliberately ends mid-drag. A release has to be issued from the same
    // pointer() call as its press or userEvent emits no pointerup at all, and
    // splitting this story's asserts across calls matters more here than
    // finishing the gesture — AddButtonReturnsAfterTheDrag covers the release.
  },
};

/**
 * Releasing the grabber brings the button back on the spot — no pointer move
 * needed — and against the column's new edge, not the one it had before the
 * drag.
 */
export const AddButtonReturnsAfterTheDrag: Story = {
  play: async ({ canvasElement }) => {
    const table = await tableOf(canvasElement);
    const lastCell = [...(table.rows[0]?.cells ?? [])].at(-1);
    if (!lastCell) throw new Error("fixture needs a last cell");

    const cellBox = lastCell.getBoundingClientRect();
    const midY = cellBox.top + cellBox.height / 2;
    const addButton = () =>
      canvasElement.querySelector<HTMLElement>("[data-table-hover-btn]");

    await userEvent.pointer({
      target: lastCell,
      coords: { clientX: cellBox.right - 14, clientY: midY },
    });
    await waitFor(() => {
      expect(addButton()).not.toBeNull();
    });

    await userEvent.pointer({
      target: lastCell,
      coords: { clientX: cellBox.right, clientY: midY },
    });
    const grabber = await waitFor(() => {
      const node = canvasElement.querySelector<HTMLElement>(
        "[data-table-column-resizer]",
      );
      if (!node) throw new Error("grabber never appeared");
      return node;
    });

    const grabberBox = grabber.getBoundingClientRect();
    const x = grabberBox.left + grabberBox.width / 2;
    const y = grabberBox.top + grabberBox.height / 2;
    const dragTo = x - 30;
    const widthBefore = lastCell.getBoundingClientRect().width;

    // Press, drag and release in ONE pointer() call: userEvent keeps its
    // pressed-button state per call, so a release issued from a separate call
    // is a no-op and pointerup — the whole commit path — never fires.
    await userEvent.pointer([
      {
        keys: "[MouseLeft>]",
        target: grabber,
        coords: { clientX: x, clientY: y },
      },
      { target: grabber, coords: { clientX: dragTo, clientY: y } },
      {
        keys: "[/MouseLeft]",
        target: grabber,
        coords: { clientX: dragTo, clientY: y },
      },
    ]);

    // The drag has to have actually resized something, or "the button came
    // back" would prove nothing about re-measuring.
    expect(lastCell.getBoundingClientRect().width).toBeLessThan(
      widthBefore - 10,
    );

    // Back with no further pointer movement...
    const button = await waitFor(() => {
      const node = addButton();
      if (!node) throw new Error("add button never came back after release");
      return node;
    });

    // ...and on the edge the drag left behind.
    const buttonBox = button.getBoundingClientRect();
    const tableRight = table.getBoundingClientRect().right;
    expect(
      Math.abs(buttonBox.left + buttonBox.width / 2 - tableRight),
    ).toBeLessThan(16);
  },
};

/**
 * Whatever happened before, hovering the right stripe has to raise the button
 * again. Three ways to get the plugin into a non-resting state — a completed
 * drag, a press on the grabber that never became a drag, and typing — each
 * followed by a plain hover.
 */
const hoverRaisesAddButtonAfter = (
  prepare: (context: {
    canvasElement: HTMLElement;
    table: HTMLTableElement;
    lastCell: HTMLTableCellElement;
  }) => Promise<void>,
): Story => ({
  play: async ({ canvasElement }) => {
    const table = await tableOf(canvasElement);
    const lastCell = [...(table.rows[0]?.cells ?? [])].at(-1);
    const firstCell = table.rows[0]?.cells[0];
    if (!lastCell || !firstCell) throw new Error("fixture incomplete");

    await prepare({ canvasElement, table, lastCell });

    // Park somewhere with no affordance so the assertion cannot pass on a
    // button left over from the setup.
    const firstBox = firstCell.getBoundingClientRect();
    await userEvent.pointer({
      target: firstCell,
      coords: {
        clientX: firstBox.left + 6,
        clientY: firstBox.top + firstBox.height / 2,
      },
    });
    await waitFor(() => {
      expect(canvasElement.querySelector("[data-table-hover-btn]")).toBeNull();
    });

    // Then hover the right stripe, as a user would.
    const cellBox = lastCell.getBoundingClientRect();
    await userEvent.pointer({
      target: lastCell,
      coords: {
        clientX: cellBox.right - 12,
        clientY: cellBox.top + cellBox.height / 2,
      },
    });
    await waitFor(() => {
      expect(
        canvasElement.querySelector("[data-table-hover-btn]"),
      ).not.toBeNull();
    });
  },
});

export const HoverStillRaisesAddButtonAfterADrag: Story =
  hoverRaisesAddButtonAfter(async ({ canvasElement, table }) => {
    const grabber = await grabBoundary(
      canvasElement,
      table,
      (table.rows[0]?.cells.length ?? 1) - 1,
    );
    const box = grabber.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    await userEvent.pointer([
      {
        keys: "[MouseLeft>]",
        target: grabber,
        coords: { clientX: x, clientY: y },
      },
      { target: grabber, coords: { clientX: x - 25, clientY: y } },
      {
        keys: "[/MouseLeft]",
        target: grabber,
        coords: { clientX: x - 25, clientY: y },
      },
    ]);
  });

export const HoverStillRaisesAddButtonAfterAGrabberClick: Story =
  hoverRaisesAddButtonAfter(async ({ canvasElement, table }) => {
    const grabber = await grabBoundary(
      canvasElement,
      table,
      (table.rows[0]?.cells.length ?? 1) - 1,
    );
    const box = grabber.getBoundingClientRect();
    const coords = {
      clientX: box.left + box.width / 2,
      clientY: box.top + box.height / 2,
    };
    await userEvent.pointer([
      { keys: "[MouseLeft>]", target: grabber, coords },
      { keys: "[/MouseLeft]", target: grabber, coords },
    ]);
  });

export const HoverStillRaisesAddButtonAfterTyping: Story =
  hoverRaisesAddButtonAfter(async ({ lastCell }) => {
    await userEvent.click(lastCell);
    await userEvent.keyboard("hi");
  });

/**
 * Arriving at the right stripe from OUTSIDE the table, not out of a cell. The
 * pointer resolves to no cell there, and the near-table fallback only kept
 * whatever state was already up — so a pointer that came in from the margin
 * raised nothing at all.
 */
export const AddButtonAppearsArrivingFromOutsideTheTable: Story = {
  play: async ({ canvasElement }) => {
    const table = await tableOf(canvasElement);
    const firstCell = table.rows[0]?.cells[0];
    if (!firstCell) throw new Error("fixture needs a cell");

    // Establish the table as the active one, then leave with nothing showing.
    const firstBox = firstCell.getBoundingClientRect();
    await userEvent.pointer({
      target: firstCell,
      coords: {
        clientX: firstBox.left + 6,
        clientY: firstBox.top + firstBox.height / 2,
      },
    });
    await waitFor(() => {
      expect(canvasElement.querySelector("[data-table-hover-btn]")).toBeNull();
    });

    // Now approach the right edge from the margin outside the table.
    const tableBox = table.getBoundingClientRect();
    const editorRoot = canvasElement.querySelector<HTMLElement>(
      '[contenteditable="true"]',
    );
    if (!editorRoot) throw new Error("no editor root");

    await userEvent.pointer({
      target: editorRoot,
      coords: {
        clientX: tableBox.right + 12,
        clientY: tableBox.top + tableBox.height / 2,
      },
    });

    await waitFor(() => {
      expect(
        canvasElement.querySelector("[data-table-hover-btn]"),
      ).not.toBeNull();
    });
  },
};
