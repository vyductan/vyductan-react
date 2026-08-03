import { expect, test } from "playwright/test";

import { STORYBOOK_ORIGIN } from "./dialog-selection.helpers.mjs";

const STORYBOOK_URL = `${STORYBOOK_ORIGIN}/iframe.html?id=components-alertmodal--default`;

/**
 * AlertModal is a separate Radix family from Modal (`alert-dialog-*` slots), and
 * the selection layer is keyed by `data-slot` — so it has to opt in explicitly.
 * When it did not, the content still selected natively, but the alert box is
 * short (~156px): a drag straying ~5px past its edge collapsed the selection to
 * "\n" and Cmd+C came back empty.
 */
async function openAlertModal(page, context) {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: STORYBOOK_ORIGIN,
  });
  await page.goto(STORYBOOK_URL, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /open delete modal/i }).click();

  const content = page.locator("[data-slot='alert-dialog-content']");
  await content.waitFor({ state: "visible", timeout: 30_000 });

  const boxes = {
    content: await content.boundingBox(),
    title: await page.locator("[data-slot='alert-dialog-title']").boundingBox(),
    description: await page
      .locator("[data-slot='alert-dialog-description']")
      .boundingBox(),
  };
  if (!boxes.content || !boxes.title || !boxes.description) {
    throw new Error("Missing alert modal bounding box");
  }
  return boxes;
}

const readSelection = (page) =>
  page.evaluate(() => globalThis.getSelection()?.toString() ?? "");

test("a drag inside the alert modal selects across title and description", async ({
  page,
  context,
}) => {
  const { title, description } = await openAlertModal(page, context);

  await page.mouse.move(title.x + 2, title.y + title.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    description.x + description.width - 2,
    description.y + description.height / 2,
    { steps: 10 },
  );
  await page.mouse.up();

  const selection = await readSelection(page);
  expect(selection).toContain("lete item");
  expect(selection).toContain("This action cannot be undone.");
});

test("a drag straying past the alert modal clamps to its text instead of wiping it", async ({
  page,
  context,
}) => {
  const { content, title, description } = await openAlertModal(page, context);

  await page.mouse.move(title.x + 2, title.y + title.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    description.x + 30,
    description.y + description.height / 2,
    { steps: 4 },
  );
  // out through the bottom edge, well onto the overlay
  await page.mouse.move(
    content.x + content.width / 2,
    content.y + content.height + 120,
    { steps: 12 },
  );
  await page.mouse.up();
  await page.keyboard.press("ControlOrMeta+C");

  await expect
    .poll(
      async () =>
        page.evaluate(async () => ({
          selection: globalThis.getSelection()?.toString() ?? "",
          clipboardText: await navigator.clipboard.readText(),
        })),
      { timeout: 1000 },
    )
    .toEqual({
      selection: expect.stringContaining("This action cannot be undone."),
      clipboardText: expect.stringContaining("This action cannot be undone."),
    });

  const selection = await readSelection(page);
  // Dragging out selects THROUGH the end of the content's own text — footer
  // button labels are chrome and stay out of the copy.
  expect(selection.endsWith("undone.")).toBe(true);
  expect(selection).not.toContain("Cancel");
});

test("straying out through the top clamps back to the start of the alert modal", async ({
  page,
  context,
}) => {
  const { content, description } = await openAlertModal(page, context);

  await page.mouse.move(
    description.x + 30,
    description.y + description.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    description.x + 60,
    description.y + description.height / 2,
    { steps: 3 },
  );
  await page.mouse.move(content.x + content.width / 2, content.y - 120, {
    steps: 12,
  });
  await page.mouse.up();

  const selection = await readSelection(page);
  expect(selection.startsWith("Delete item")).toBe(true);
  expect(selection).not.toContain("undone.");
});
