"use client";

import type { MenuProps } from "@/components/ui/menu";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { Space } from "@/components/ui/space";

const items: MenuProps["items"] = [
  {
    key: "1",
    label: "1st menu item",
  },
  {
    key: "2",
    label: "2nd menu item",
  },
  {
    key: "3",
    label: "3rd menu item",
  },
];

const App: React.FC = () => (
  <Space direction="vertical" size="large" className="w-full">
    <Space wrap>
      <Dropdown menu={{ items }} trigger={["click"]}>
        <Button variant="outlined">Click only</Button>
      </Dropdown>

      <Dropdown menu={{ items }} trigger={["hover"]}>
        <Button variant="outlined">Hover only</Button>
      </Dropdown>

      <Dropdown menu={{ items }} trigger={["contextMenu"]}>
        <Button variant="outlined">Right click only</Button>
      </Dropdown>
    </Space>

    <Space wrap>
      <Dropdown menu={{ items }} trigger={["click", "hover"]}>
        <Button variant="outlined">Click or Hover</Button>
      </Dropdown>

      <Dropdown menu={{ items }} trigger={["click", "contextMenu"]}>
        <Button variant="outlined">Click or Right click</Button>
      </Dropdown>

      <Dropdown menu={{ items }} trigger={["hover", "contextMenu"]}>
        <Button variant="outlined">Hover or Right click</Button>
      </Dropdown>
    </Space>

    <Space wrap>
      <Dropdown menu={{ items }} trigger={["click", "hover", "contextMenu"]}>
        <Button variant="outlined">All triggers</Button>
      </Dropdown>
    </Space>
  </Space>
);

export default App;
