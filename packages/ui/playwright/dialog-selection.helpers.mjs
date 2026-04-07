import { chromium, expect } from "playwright/test";

export const STORYBOOK_ORIGIN =
  process.env.STORYBOOK_ORIGIN ?? "http://127.0.0.1:6006";

export async function expectReverseDragCopyFromHeading({
  storybookUrl,
  openButtonName,
  headingName,
  expectedText,
  missingBoxMessage,
}) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: STORYBOOK_ORIGIN,
  });
  const page = await context.newPage();

  try {
    await page.goto(storybookUrl, { waitUntil: "networkidle" });

    await page.getByRole("button", { name: openButtonName }).click();

    const heading = page.getByRole("heading", { name: headingName });
    await heading.waitFor({ state: "visible", timeout: 30_000 });

    const box = await heading.boundingBox();
    if (!box) {
      throw new Error(missingBoxMessage);
    }

    await page.mouse.move(box.x + box.width - 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x - 300, box.y + box.height / 2, {
      steps: 30,
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
        selection: expectedText,
        clipboardText: expectedText,
      });
  } finally {
    await browser.close();
  }
}
