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
import { editorRenderFixtures } from "./render/render-fixtures";

const meta = {
  title: "Components/Editor/Table Action Menu",
  component: Editor,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof Editor>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The resting mark has to read as a line, not a lozenge. Notion's own bar is
 * 18x6, but our cells are narrower (96px against Notion's 150px), so the same
 * bar carries more visual weight and we run 2px thinner. Pinned because a
 * future "match Notion exactly" pass would otherwise fatten it back silently.
 */
const MAX_HANDLE_BAR_THICKNESS = 4;
const MIN_HANDLE_BAR_LENGTH = 16;

export const Interactions: Story = {
  args: {
    value: editorRenderFixtures.table.serialized,
    variant: "simple",
    autoFocus: false,
    onChange: fn(),
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const table = canvasElement.querySelector("table");

    await expect(table).toBeTruthy();

    if (!(table instanceof HTMLTableElement)) {
      throw new TypeError("Expected rendered table element");
    }

    const firstHeaderCell = table.rows[0]?.cells[0];
    const firstBodyCell = table.rows[1]?.cells[0];

    await expect(firstHeaderCell).toBeTruthy();
    await expect(firstBodyCell).toBeTruthy();

    await step("Focused table cell shows row and column handles", async () => {
      fireEvent.mouseUp(firstHeaderCell as HTMLTableCellElement);

      await waitFor(async () => {
        await expect(
          canvas.getByRole("button", { name: /row actions/i }),
        ).toBeInTheDocument();
        await expect(
          canvas.getByRole("button", { name: /column actions/i }),
        ).toBeInTheDocument();
      });
    });

    await step("Row handle opens from click", async () => {
      const rowHandle = canvas.getByRole("button", { name: /row actions/i });
      fireEvent.click(rowHandle);

      await waitFor(async () => {
        await expect(rowHandle).toHaveAttribute("aria-expanded", "true");
        await expect(rowHandle).toHaveAttribute("data-state", "open");
      });
    });

    await step(
      "Clicking another table cell keeps action handles available",
      async () => {
        const rowHandle = canvasElement.querySelector<HTMLButtonElement>(
          'button[aria-label="Row actions"]',
        );

        await expect(rowHandle).toBeTruthy();

        fireEvent.click(rowHandle as HTMLButtonElement);

        await waitFor(async () => {
          await expect(rowHandle).toHaveAttribute("aria-expanded", "false");
          await expect(rowHandle).toHaveAttribute("data-state", "closed");
        });

        fireEvent.mouseUp(firstBodyCell as HTMLTableCellElement);

        await waitFor(async () => {
          await expect(
            canvas.getByRole("button", { name: /row actions/i }),
          ).toBeInTheDocument();
          await expect(
            canvas.getByRole("button", { name: /column actions/i }),
          ).toBeInTheDocument();
        });
      },
    );

    await step(
      "Selecting a row color preset updates the active row",
      async () => {
        const body = within(document.body);
        const rowHandle = canvas.getByRole("button", { name: /row actions/i });

        fireEvent.click(rowHandle);
        await userEvent.click(
          await body.findByRole("menuitem", { name: /color/i }),
        );
        await userEvent.click(
          await body.findByRole("menuitem", { name: /blue/i }),
        );

        await waitFor(async () => {
          await expect(table.rows[1]?.cells[0]).toHaveStyle({
            backgroundColor: "rgb(219, 234, 254)",
          });
          await expect(table.rows[1]?.cells[1]).toHaveStyle({
            backgroundColor: "rgb(219, 234, 254)",
          });
        });
      },
    );
  },
};

/**
 * Where the handles sit relative to the table they act on. They rest flush on
 * the grid line their axis starts at, the way Notion does it — a handle floating
 * in the margin reads as unattached, and it is ambiguous which row or column it
 * would act on once the table is dense.
 */
export const HandlesStraddleTheGridLine: Story = {
  args: {
    value: editorRenderFixtures.table.serialized,
    variant: "simple",
    autoFocus: false,
    onChange: fn(),
  },
  play: measureHandles,
};

/**
 * The handles hang just outside the table, so a field with little horizontal
 * padding is where they would be pushed off position first.
 */
export const HandlesStraddleTheGridLineWhenPaddingIsTight: Story = {
  args: {
    value: editorRenderFixtures.table.serialized,
    variant: "simple",
    contentClassName: "px-3 py-2",
    autoFocus: false,
    onChange: fn(),
  },
  play: measureHandles,
};

async function measureHandles({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) {
  {
    const canvas = within(canvasElement);
    const table = canvasElement.querySelector("table");

    if (!(table instanceof HTMLTableElement)) {
      throw new TypeError("Expected rendered table element");
    }

    const cell = table.rows[0]?.cells[0];
    fireEvent.mouseUp(cell as HTMLTableCellElement);

    const columnHandle = await waitFor(() =>
      canvas.getByRole("button", { name: /column actions/i }),
    );
    const rowHandle = canvas.getByRole("button", { name: /row actions/i });

    // Re-focus once the layout has settled: the plugin captures the table rect
    // during render, so a scroll triggered by the first click would leave it
    // measuring a position the table has since left.
    fireEvent.mouseUp(cell as HTMLTableCellElement);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const tableBox = table.getBoundingClientRect();

    // Measured on the bar, not the button: the button is a larger transparent
    // target that also holds the hover glyph, so its box says nothing about
    // where the visible mark sits.
    const barOf = (handle: HTMLElement) => {
      const bar = handle.querySelector('[data-slot="table-handle-bar"]');
      if (!bar) throw new Error("handle has no bar");
      return bar.getBoundingClientRect();
    };

    // Straddling, not flush: each bar is centred on the grid line its axis
    // starts at, the way Notion's own selector sits (18x6 at tableTop - 2).
    const columnBox = barOf(columnHandle);
    const rowBox = barOf(rowHandle);

    expect(
      Math.abs(columnBox.top + columnBox.height / 2 - tableBox.top),
    ).toBeLessThan(2);
    expect(
      Math.abs(rowBox.left + rowBox.width / 2 - tableBox.left),
    ).toBeLessThan(2);

    // And they stay bars rather than growing into buttons that cover the cell.
    expect(columnBox.height).toBeLessThan(10);
    expect(rowBox.width).toBeLessThan(10);

    // The grip glyph is the hover state; at rest only the bar shows.
    expect(columnHandle.querySelector("svg")).not.toBeVisible();
  }
}

/**
 * The handles follow the pointer, not the caret. Notion shows them for whatever
 * cell you are over — no click needed, and they move as you cross into another
 * column — so a pair of bars parked on the last cell you clicked reads as stuck.
 */
export const HandlesFollowThePointer: Story = {
  args: {
    value: editorRenderFixtures.table.serialized,
    variant: "simple",
    autoFocus: false,
    onChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const table = canvasElement.querySelector("table");

    if (!(table instanceof HTMLTableElement)) {
      throw new TypeError("Expected rendered table element");
    }

    const centreOf = (element: Element) => {
      const box = element.getBoundingClientRect();
      return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
    };

    const columnBarCentre = async () => {
      const handle = await waitFor(() =>
        canvas.getByRole("button", { name: /column actions/i }),
      );
      const bar = handle.querySelector('[data-slot="table-handle-bar"]');
      if (!bar) throw new Error("handle has no bar");
      return centreOf(bar).x;
    };

    const first = table.rows[0]?.cells[0];
    const other = table.rows[1]?.cells[1];
    if (!first || !other) throw new Error("fixture needs two columns");

    // Hover only — never a click.
    await userEvent.hover(first);
    await waitFor(async () => {
      expect(
        Math.abs((await columnBarCentre()) - centreOf(first).x),
      ).toBeLessThan(2);
    });

    await userEvent.hover(other);
    await waitFor(async () => {
      expect(
        Math.abs((await columnBarCentre()) - centreOf(other).x),
      ).toBeLessThan(2);
    });
  },
};

/**
 * A caret in one cell must not pin the handles there. Notion moves them to
 * whatever cell the pointer is over even while another cell holds the caret,
 * and the plugin re-syncs from the selection on every editor update — so the
 * pointer has to win, or the bars snap back to the focused cell.
 */
export const PointerWinsOverTheCaret: Story = {
  args: {
    value: editorRenderFixtures.table.serialized,
    variant: "simple",
    autoFocus: false,
    onChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const table = canvasElement.querySelector("table");

    if (!(table instanceof HTMLTableElement)) {
      throw new TypeError("Expected rendered table element");
    }

    const focused = table.rows[0]?.cells[0];
    const hovered = table.rows[1]?.cells[1];
    if (!focused || !hovered) throw new Error("fixture needs two columns");

    const columnBarX = async () => {
      const handle = await waitFor(() =>
        canvas.getByRole("button", { name: /column actions/i }),
      );
      const bar = handle.querySelector('[data-slot="table-handle-bar"]');
      if (!bar) throw new Error("handle has no bar");
      const box = bar.getBoundingClientRect();
      return box.left + box.width / 2;
    };

    const centreX = (element: Element) => {
      const box = element.getBoundingClientRect();
      return box.left + box.width / 2;
    };

    // Put the caret in the first cell, then leave it there.
    fireEvent.mouseUp(focused);
    await waitFor(async () => {
      expect(Math.abs((await columnBarX()) - centreX(focused))).toBeLessThan(2);
    });

    await userEvent.hover(hovered);

    await waitFor(async () => {
      expect(Math.abs((await columnBarX()) - centreX(hovered))).toBeLessThan(2);
    });

    // An editor update is what re-runs the selection sync, so the pointer has to
    // still win after one. Typing into the focused cell is the ordinary way one
    // arrives while the pointer rests elsewhere.
    await userEvent.click(focused);
    await userEvent.keyboard("x");
    await userEvent.hover(hovered);

    await waitFor(async () => {
      expect(Math.abs((await columnBarX()) - centreX(hovered))).toBeLessThan(2);
    });
  },
};

/**
 * The overlays are `absolute` inside the portal target, which lives inside the
 * scroll container — so their offsets are scroll-invariant and no listener is
 * involved. They were `fixed` off viewport rects, which left them parked while
 * the table scrolled away.
 */
export const HandlesStayWithTheTableOnScroll: Story = {
  args: {
    value: editorRenderFixtures.table.serialized,
    variant: "simple",
    // Short enough that the fixture overflows and the container can scroll.
    className: "max-h-[180px] min-h-0 sm:min-h-0",
    autoFocus: false,
    onChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const table = canvasElement.querySelector("table");

    if (!(table instanceof HTMLTableElement)) {
      throw new TypeError("Expected rendered table element");
    }

    const scroller = canvasElement.querySelector<HTMLElement>(
      ".editor-scroll-container",
    );
    if (!scroller) throw new Error("no scroll container");

    const cell = table.rows[0]?.cells[0];
    if (!cell) throw new Error("fixture needs a cell");

    await userEvent.hover(cell);

    const barTopOffset = async () => {
      const handle = await waitFor(() =>
        canvas.getByRole("button", { name: /column actions/i }),
      );
      const bar = handle.querySelector('[data-slot="table-handle-bar"]');
      if (!bar) throw new Error("handle has no bar");
      const box = bar.getBoundingClientRect();
      // Distance from the bar's centre to the table's top line: this is what
      // must survive a scroll, not the absolute viewport position.
      return box.top + box.height / 2 - table.getBoundingClientRect().top;
    };

    await waitFor(async () => {
      expect(Math.abs(await barTopOffset())).toBeLessThan(2);
    });

    const tableTopBefore = table.getBoundingClientRect().top;

    scroller.scrollTop = 60;
    scroller.dispatchEvent(new Event("scroll", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Without a real scroll the assertion below proves nothing: the container
    // has to be tall enough for the table to actually move.
    expect(scroller.scrollTop).toBeGreaterThan(0);
    expect(
      Math.abs(table.getBoundingClientRect().top - tableTopBefore),
    ).toBeGreaterThan(10);

    expect(Math.abs(await barTopOffset())).toBeLessThan(2);
  },
};

/**
 * Re-measuring on scroll leaves the handles a frame behind, which reads as the
 * bars stuttering alongside the table. This measures in the same task as the
 * scroll — no frame, no timeout — so only positioning intrinsically tied to the
 * table can pass, which is the point of being `absolute` inside the anchor.
 */
export const HandlesDoNotLagAScroll: Story = {
  args: {
    value: editorRenderFixtures.table.serialized,
    variant: "simple",
    className: "max-h-[180px] min-h-0 sm:min-h-0",
    autoFocus: false,
    onChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const table = canvasElement.querySelector("table");

    if (!(table instanceof HTMLTableElement)) {
      throw new TypeError("Expected rendered table element");
    }

    const scroller = canvasElement.querySelector<HTMLElement>(
      ".editor-scroll-container",
    );
    const cell = table.rows[0]?.cells[0];
    if (!scroller || !cell) throw new Error("fixture incomplete");

    await userEvent.hover(cell);

    const handle = await waitFor(() =>
      canvas.getByRole("button", { name: /column actions/i }),
    );
    const bar = handle.querySelector('[data-slot="table-handle-bar"]');
    if (!bar) throw new Error("handle has no bar");

    const offset = () => {
      const box = bar.getBoundingClientRect();
      return box.top + box.height / 2 - table.getBoundingClientRect().top;
    };

    await waitFor(() => {
      expect(Math.abs(offset())).toBeLessThan(2);
    });

    // Read back synchronously — no await, no frame, no timeout.
    scroller.scrollTop = 60;
    expect(scroller.scrollTop).toBeGreaterThan(0);
    expect(Math.abs(offset())).toBeLessThan(2);
  },
};

/**
 * `position: fixed` silently re-anchors to any ancestor that establishes a
 * containing block — a transform, a filter, `contain`. A Storybook docs page
 * does exactly that, which is why handles that measured correctly in an isolated
 * story landed hundreds of px from their table in docs. Geometry alone cannot
 * catch it from inside a story, so this pins the positioning scheme itself.
 */
export const HandlesArePositionedAgainstTheAnchor: Story = {
  args: {
    value: editorRenderFixtures.table.serialized,
    variant: "simple",
    autoFocus: false,
    onChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const table = canvasElement.querySelector("table");

    if (!(table instanceof HTMLTableElement)) {
      throw new TypeError("Expected rendered table element");
    }

    const cell = table.rows[0]?.cells[0];
    if (!cell) throw new Error("fixture needs a cell");

    await userEvent.hover(cell);

    const rowHandle = await waitFor(() =>
      canvas.getByRole("button", { name: /row actions/i }),
    );
    const columnHandle = canvas.getByRole("button", {
      name: /column actions/i,
    });

    const barOf = (handle: HTMLElement) => {
      const bar = handle.querySelector('[data-slot="table-handle-bar"]');
      if (!bar) throw new Error("handle has no bar");
      return bar.getBoundingClientRect();
    };

    const tableBox = table.getBoundingClientRect();
    const rowBar = barOf(rowHandle);
    const columnBar = barOf(columnHandle);

    expect(
      Math.abs(rowBar.left + rowBar.width / 2 - tableBox.left),
    ).toBeLessThan(2);
    expect(
      Math.abs(columnBar.top + columnBar.height / 2 - tableBox.top),
    ).toBeLessThan(2);

    // Asserted on the positioning scheme, not only on the geometry: an
    // isolated story has no containing-block ancestor, so `fixed` measures
    // correctly here and the geometry check alone stays green while docs pages
    // break. Being `absolute` inside the portal target is the property that
    // actually holds everywhere.
    for (const handle of [rowHandle, columnHandle]) {
      const wrapper = handle.closest<HTMLElement>("div[style]");
      expect(wrapper).not.toBeNull();
      expect(globalThis.getComputedStyle(wrapper!).position).toBe("absolute");
    }

    // The add-row/add-column affordance is a separate plugin with the same
    // trap, so it is pinned in the same place rather than left to be found in
    // a docs page later.
    const lastCell = [...(table.rows[0]?.cells ?? [])].at(-1);
    if (!lastCell) throw new Error("fixture needs a last cell");
    const lastCellBox = lastCell.getBoundingClientRect();

    await userEvent.pointer({
      // Targeting the cell, not the table: the plugin resolves the pointer via
      // `closest("td, th")`, which a table element itself never satisfies.
      target: lastCell,
      coords: {
        // Inside the right stripe the plugin watches, and further from the
        // boundary than RESIZE_HIT_PX so the resizer does not claim the pointer.
        clientX: lastCellBox.right - 14,
        clientY: lastCellBox.top + lastCellBox.height / 2,
      },
    });

    const addButton = await waitFor(() => {
      const node = canvasElement.querySelector<HTMLElement>(
        "[data-table-hover-btn]",
      );
      if (!node) throw new Error("add-column affordance never appeared");
      return node;
    });

    expect(globalThis.getComputedStyle(addButton).position).toBe("absolute");
    const addBox = addButton.getBoundingClientRect();
    expect(Math.abs(addBox.left - tableBox.right)).toBeLessThan(8);
  },
};

export const HandleBarsReadAsThinLines: Story = {
  args: {
    value: editorRenderFixtures.table.serialized,
    variant: "simple",
    autoFocus: false,
    onChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const table = canvasElement.querySelector("table");

    if (!(table instanceof HTMLTableElement)) {
      throw new TypeError("Expected rendered table element");
    }

    const cell = table.rows[0]?.cells[0];
    if (!cell) throw new Error("fixture needs a cell");

    await userEvent.hover(cell);

    const rowHandle = await waitFor(() =>
      canvas.getByRole("button", { name: /row actions/i }),
    );
    const columnHandle = canvas.getByRole("button", {
      name: /column actions/i,
    });

    const barOf = (handle: HTMLElement) => {
      const bar = handle.querySelector('[data-slot="table-handle-bar"]');
      if (!bar) throw new Error("handle has no bar");
      return bar.getBoundingClientRect();
    };

    // Measured on the box, not the class, so a padding or scale change that
    // fattens the rendered bar fails here too.
    for (const box of [barOf(rowHandle), barOf(columnHandle)]) {
      expect(Math.min(box.width, box.height)).toBeLessThanOrEqual(
        MAX_HANDLE_BAR_THICKNESS,
      );
      expect(Math.max(box.width, box.height)).toBeGreaterThanOrEqual(
        MIN_HANDLE_BAR_LENGTH,
      );
    }

    // The bar got thinner; the thing you have to hit did not.
    for (const handle of [rowHandle, columnHandle]) {
      const box = handle.getBoundingClientRect();
      expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(14);
    }
  },
};
