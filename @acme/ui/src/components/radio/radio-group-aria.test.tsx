import React from "react";

import "@testing-library/jest-dom/vitest";

import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { RadioGroup } from "./index";

globalThis.React = React;

describe("RadioGroup options API", () => {
  // Regression: `aria-label` exists only on the Radix root, so the XOR type
  // flipped to that branch and `options` / `variant` stopped typechecking.
  // This file failing `tsc` is the regression signal.
  test("accepts Radix root attributes alongside options", () => {
    render(
      <RadioGroup
        aria-label="How the guest and the tour meet"
        variant="card"
        options={[
          { label: "Meeting point", value: "meet" },
          { label: "Hotel pick-up", value: "pickup" },
        ]}
      />,
    );

    expect(
      screen.getByRole("radiogroup", {
        name: "How the guest and the tour meet",
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });
});
