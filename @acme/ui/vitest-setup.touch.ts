// The class under test is a Tailwind variant, so the compiled stylesheet has to
// be in the page — without it every `display` assertion would pass vacuously.
import "@acme/ui/styles/globals.css";
import "@testing-library/jest-dom/vitest";
