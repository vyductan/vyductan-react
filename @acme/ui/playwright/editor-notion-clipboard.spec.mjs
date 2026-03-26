import { test, expect, chromium } from "playwright/test";

const STORYBOOK_ORIGIN = process.env.STORYBOOK_ORIGIN ?? "http://127.0.0.1:6006";
const STORYBOOK_URL = `${STORYBOOK_ORIGIN}/iframe.html?id=components-editor--playground`;
const NOTION_PAGE_URL = process.env.NOTION_PAGE_URL;
const RUN_NOTION_E2E = process.env.RUN_NOTION_E2E === "1";

async function readClipboard(page) {
  return await page.evaluate(async () => {
    const items = await navigator.clipboard.read();
    const result = {};

    for (const item of items) {
      for (const type of item.types) {
        const blob = await item.getType(type);
        result[type] = await blob.text();
      }
    }

    return result;
  });
}

async function loadStorybookEditor(page) {
  await page.goto(STORYBOOK_URL, { waitUntil: "networkidle" });
  const editor = page.locator('[contenteditable="true"][data-lexical-editor="true"]').first();
  await editor.waitFor({ state: "visible", timeout: 30000 });
  return editor;
}

async function clearEditor(page, editor) {
  await editor.click({ force: true });
  await page.keyboard.press("Meta+A");
  await page.keyboard.press("Backspace");
}

async function typeSoftLineBreakBlock(page, editor) {
  await clearEditor(page, editor);
  await editor.pressSequentially("SOFT_A <Age> Any age OK");
  await page.keyboard.press("Shift+Enter");
  await editor.pressSequentially("SOFT_B <Discount> *0-2 yrs old are free");
  await page.keyboard.press("Shift+Enter");
  await editor.pressSequentially("SOFT_C 3-12 yrs: 2,750 yen disount per child");
}

async function typeMultiParagraphBlock(page, editor) {
  await clearEditor(page, editor);
  await editor.pressSequentially("VERIFY_A <Age> Any age OK");
  await page.keyboard.press("Enter");
  await editor.pressSequentially("VERIFY_B <Discount> *0-2 yrs old are free");
  await page.keyboard.press("Enter");
  await editor.pressSequentially("VERIFY_C 3-12 yrs: 2,750 yen disount per child");
}

async function selectAllContent(editor) {
  await editor.evaluate((element) => {
    element.focus();
    const selection = window.getSelection();
    if (!selection) {
      throw new Error("Selection API unavailable");
    }
    const range = document.createRange();
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
  });
}

async function copySelection(page, editor) {
  await selectAllContent(editor);
  await page.keyboard.press("Meta+C");
  await page.waitForTimeout(300);
  return await readClipboard(page);
}

async function dismissNotionDialog(page) {
  const dialogButton = page.getByRole("button", { name: /dismiss|not now|continue in browser/i }).first();
  if (await dialogButton.isVisible().catch(() => false)) {
    await dialogButton.click();
  }
}

async function getNotionEditableLeaf(page) {
  const byPlaceholder = page.locator('[data-content-editable-leaf="true"][placeholder*="Press"]').first();
  if (await byPlaceholder.isVisible().catch(() => false)) {
    return byPlaceholder;
  }

  const leaves = page.locator('[data-content-editable-leaf="true"]');
  const count = await leaves.count();
  if (count === 0) {
    throw new Error("No Notion editable leaf found");
  }
  return leaves.nth(count - 1);
}

async function pasteIntoNotionAndCollect(page) {
  await dismissNotionDialog(page);
  const leaf = await getNotionEditableLeaf(page);
  await leaf.click({ force: true });
  await page.keyboard.press("Meta+V");
  await page.waitForTimeout(1000);

  return await page.evaluate(() => {
    const leaves = Array.from(document.querySelectorAll('[data-content-editable-leaf="true"]'));
    const nonEmptyLeaves = leaves.filter((leaf) => (leaf.textContent ?? "").trim().length > 0);
    const blockIds = new Set(
      nonEmptyLeaves
        .map((leaf) => leaf.closest('[data-block-id]')?.getAttribute('data-block-id'))
        .filter(Boolean),
    );

    return {
      count: nonEmptyLeaves.length,
      uniqueBlockCount: blockIds.size,
      texts: nonEmptyLeaves.map((leaf) => leaf.textContent ?? ""),
    };
  });
}

test.describe("editor clipboard retest workflow", () => {
  test("captures Storybook clipboard payloads for the two regression cases", async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    await context.grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: STORYBOOK_ORIGIN,
    });
    const page = await context.newPage();

    try {
      const editor = await loadStorybookEditor(page);

      await typeSoftLineBreakBlock(page, editor);
      const softPayload = await copySelection(page, editor);
      expect(softPayload["text/plain"]).toContain("SOFT_A <Age> Any age OK\nSOFT_B <Discount> *0-2 yrs old are free");
      expect(softPayload["text/plain"]).not.toContain("SOFT_A <Age> Any age OK\n\nSOFT_B");
      expect(softPayload["text/html"]).toContain('white-space: break-spaces');

      await typeMultiParagraphBlock(page, editor);
      const multiPayload = await copySelection(page, editor);
      expect(multiPayload["text/plain"]).toContain("VERIFY_A <Age> Any age OK\n\nVERIFY_B <Discount> *0-2 yrs old are free\n\nVERIFY_C 3-12 yrs: 2,750 yen disount per child");
      expect(multiPayload["text/html"]).toContain("<p");
    } finally {
      await browser.close();
    }
  });

  test("pastes the verified clipboard payloads into Notion", async () => {
    test.skip(
      !RUN_NOTION_E2E || !NOTION_PAGE_URL,
      "Set RUN_NOTION_E2E=1 and NOTION_PAGE_URL to enable the live Notion check.",
    );

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    await context.grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: STORYBOOK_ORIGIN,
    });

    const storybookPage = await context.newPage();
    const notionPage = await context.newPage();

    try {
      const editor = await loadStorybookEditor(storybookPage);

      await typeSoftLineBreakBlock(storybookPage, editor);
      const softPayload = await copySelection(storybookPage, editor);
      expect(softPayload["text/html"]).toContain('white-space: break-spaces');

      await notionPage.goto(NOTION_PAGE_URL, { waitUntil: "domcontentloaded" });
      const softPaste = await pasteIntoNotionAndCollect(notionPage);
      expect(softPaste.uniqueBlockCount).toBe(1);

      await storybookPage.bringToFront();
      await typeMultiParagraphBlock(storybookPage, editor);
      const multiPayload = await copySelection(storybookPage, editor);
      expect(multiPayload["text/plain"]).toContain("\n\nVERIFY_B");

      await notionPage.goto(NOTION_PAGE_URL, { waitUntil: "domcontentloaded" });
      const multiPaste = await pasteIntoNotionAndCollect(notionPage);
      expect(multiPaste.uniqueBlockCount).toBeGreaterThanOrEqual(3);
    } finally {
      await browser.close();
    }
  });
});
