// React Testing Library only auto-registers its cleanup when vitest `globals`
// are on; this project keeps them off, so nothing unmounted what a test
// rendered. Every render stayed live for the whole file, and at teardown jsdom
// went away while React still had scheduler work queued — surfacing as
// "ReferenceError: window is not defined" unhandled errors that fail the run
// even when every test passes. Unmount after each test instead.
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
