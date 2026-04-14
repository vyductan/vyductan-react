import type { Meta, StoryObj } from "@storybook/nextjs-vite";
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
  tags: ["autodocs"],
} satisfies Meta<typeof Editor>;

export default meta;
type Story = StoryObj<typeof meta>;

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
