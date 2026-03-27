import React from "react";
import "@testing-library/jest-dom/vitest";
import { cleanup, render } from "@testing-library/react";
import { de } from "date-fns/locale";
import { afterEach, describe, expect, test, vi } from "vitest";

import { Calendar } from "./index";

globalThis.React = React;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Calendar locale forwarding", () => {
  test("uses locale when formatting month dropdown labels", () => {
    const toLocaleStringSpy = vi
      .spyOn(Date.prototype, "toLocaleString")
      .mockImplementation(function (this: Date, locale?: Intl.LocalesArgument) {
        return locale === de.code ? "Mär" : "Mar";
      });

    render(
      <Calendar
        mode="single"
        selected={new Date(2024, 2, 15)}
        month={new Date(2024, 2, 1)}
        locale={de}
        captionLayout="dropdown"
        startMonth={new Date(2024, 0, 1)}
        endMonth={new Date(2024, 11, 1)}
      />,
    );

    expect(toLocaleStringSpy).toHaveBeenCalledWith(de.code, { month: "short" });
  });

  test("uses locale when building day button data attributes", () => {
    vi.spyOn(Date.prototype, "toLocaleDateString").mockImplementation(
      function (this: Date, locale?: Intl.LocalesArgument) {
        return locale === de.code ? "localized-day" : "default-day";
      },
    );

    render(
      <Calendar
        mode="single"
        selected={new Date(2024, 2, 15)}
        month={new Date(2024, 2, 1)}
        locale={de}
      />,
    );

    expect(
      document.querySelector('[data-day="localized-day"]'),
    ).toBeInTheDocument();
  });
});
