import { expect, test } from "playwright/test";

import { STORYBOOK_ORIGIN } from "./dialog-selection.helpers.mjs";

const STORYBOOK_URL = `${STORYBOOK_ORIGIN}/iframe.html?id=components-modal--basic`;
const BODY_TEXT = "Some contents...";

test("modal body text remains selectable after opening the modal", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: STORYBOOK_ORIGIN,
  });

  await page.goto(STORYBOOK_URL, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Open Modal" }).click();

  const bodyText = page.getByText(BODY_TEXT).first();
  await bodyText.waitFor({ state: "visible", timeout: 30_000 });

  const box = await bodyText.boundingBox();
  if (!box) {
    throw new Error("Missing modal body text bounding box");
  }

  await page.mouse.move(box.x + 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width - 2, box.y + box.height / 2, {
    steps: 10,
  });
  await page.mouse.up();
  await page.keyboard.press("Meta+C");

  await expect
    .poll(
      async () =>
        page.evaluate(async () => ({
          selection: globalThis.getSelection()?.toString() ?? undefined,
          clipboardText: await navigator.clipboard.readText(),
        })),
      { timeout: 1000 },
    )
    .toEqual({
      selection: BODY_TEXT,
      clipboardText: BODY_TEXT,
    });
});
