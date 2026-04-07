import { chromium, expect, test } from "playwright/test";

const STORYBOOK_ORIGIN =
  process.env.STORYBOOK_ORIGIN ?? "http://127.0.0.1:6006";
const STORYBOOK_URL = `${STORYBOOK_ORIGIN}/iframe.html?id=components-modal--shadcn-style`;

test("copying dialog title from right to left outside the dialog does not include background text", async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: STORYBOOK_ORIGIN,
  });
  const page = await context.newPage();

  try {
    await page.goto(STORYBOOK_URL, { waitUntil: "networkidle" });

    await page.getByRole("button", { name: "Edit Profile" }).click();

    const heading = page.getByRole("heading", { name: "Edit profile" });
    await heading.waitFor({ state: "visible", timeout: 30_000 });

    const box = await heading.boundingBox();
    if (!box) {
      throw new Error("Missing dialog title bounding box");
    }

    await page.mouse.move(box.x + box.width - 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x - 300, box.y + box.height / 2, {
      steps: 30,
    });
    await page.mouse.up();
    await page.keyboard.press("Meta+C");
    await page.waitForTimeout(150);

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());

    expect(clipboardText).toBe("Edit profile");
  } finally {
    await browser.close();
  }
});
