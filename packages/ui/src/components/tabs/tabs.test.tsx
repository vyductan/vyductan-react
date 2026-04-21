import "@testing-library/jest-dom/vitest";

import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { Tabs } from "./tabs";

function StatefulPanel(): React.JSX.Element {
  const [count, setCount] = React.useState(0);

  return (
    <button type="button" onClick={() => setCount((value) => value + 1)}>
      count: {count}
    </button>
  );
}

describe("Tabs", () => {
  test("keeps inactive tab panels mounted when using items", () => {
    render(
      <Tabs
        defaultActiveKey="first"
        items={[
          {
            key: "first",
            label: "First",
            children: <StatefulPanel />,
          },
          {
            key: "second",
            label: "Second",
            children: <div>Second panel</div>,
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "count: 0" }));
    expect(
      screen.getByRole("button", { name: "count: 1" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Second" }));
    fireEvent.click(screen.getByRole("tab", { name: "First" }));

    expect(
      screen.getByRole("button", { name: "count: 1" }),
    ).toBeInTheDocument();
  });
});
