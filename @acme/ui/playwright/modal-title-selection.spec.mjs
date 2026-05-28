import { test } from "playwright/test";

import {
  expectReverseDragCopyFromHeading,
  STORYBOOK_ORIGIN,
} from "./dialog-selection.helpers.mjs";

const STORYBOOK_URL = `${STORYBOOK_ORIGIN}/iframe.html?id=components-modal--basic`;

test("copying modal title from right to left outside the dialog does not include background text", async () => {
  await expectReverseDragCopyFromHeading({
    storybookUrl: STORYBOOK_URL,
    openButtonName: "Open Modal",
    headingName: "Basic Modal",
    expectedText: "Basic Modal",
    missingBoxMessage: "Missing modal title bounding box",
  });
});
