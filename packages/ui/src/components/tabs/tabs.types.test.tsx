import * as React from "react";
import { describe, test } from "vitest";

import { Tabs, TabsRoot } from ".";

describe("Tabs literal key types", () => {
  test("items mode preserves literal unions for activeKey and onChange", () => {
    type TabKey = "suppliers" | "description" | "guides";

    Tabs({
      activeKey: "suppliers",
      items: [
        {
          key: "suppliers",
          label: "Suppliers",
          children: React.createElement("div"),
        },
        {
          key: "description",
          label: "Description",
          children: React.createElement("div"),
        },
        {
          key: "guides",
          label: "Guides",
          children: React.createElement("div"),
        },
      ],
      onChange: (value) => {
        const tabKey: TabKey = value;
        void tabKey;
      },
    });
  });

  test("root mode preserves literal unions for value and onValueChange", () => {
    type TabKey = "suppliers" | "description" | "guides";

    TabsRoot({
      value: "suppliers",
      onValueChange: (value) => {
        const tabKey: TabKey = value;
        void tabKey;
      },
      children: React.createElement("div"),
    });
  });

  test("wrapper mode preserves literal unions for value and onValueChange", () => {
    type TabKey = "suppliers" | "description" | "guides";

    Tabs({
      value: "suppliers",
      onValueChange: (value) => {
        const tabKey: TabKey = value;
        void tabKey;
      },
      children: React.createElement("div"),
    });
  });
});
