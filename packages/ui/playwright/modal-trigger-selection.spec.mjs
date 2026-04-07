import { test } from "playwright/test";

import {
  expectReverseDragCopyFromHeading,
  STORYBOOK_ORIGIN,
} from "./dialog-selection.helpers.mjs";

const STORYBOOK_URL = `${STORYBOOK_ORIGIN}/iframe.html?viewMode=docs&id=components-modal--docs`;

test("copying trigger-based modal title from right to left outside the dialog does not include background text", async () => {
  await expectReverseDragCopyFromHeading({
    storybookUrl: STORYBOOK_URL,
    openButtonName: "Click to Open",
    headingName: "Modal with Trigger",
    expectedText: "Modal with Trigger",
    missingBoxMessage: "Missing trigger modal title bounding box",
  });
});
