import { test } from "playwright/test";

import {
  expectReverseDragCopyFromHeading,
  STORYBOOK_ORIGIN,
} from "./dialog-selection.helpers.mjs";

const STORYBOOK_URL = `${STORYBOOK_ORIGIN}/iframe.html?id=components-modal--shadcn-style`;

test("copying dialog title from right to left outside the dialog does not include background text", async () => {
  await expectReverseDragCopyFromHeading({
    storybookUrl: STORYBOOK_URL,
    openButtonName: "Edit Profile",
    headingName: "Edit profile",
    expectedText: "Edit profile",
    missingBoxMessage: "Missing dialog title bounding box",
  });
});
