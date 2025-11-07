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
      <Dropdown menu={{ items }} placement="topLeft">
        <Button variant="outlined">Top Left</Button>
      </Dropdown>
      <Dropdown menu={{ items }} placement="top">
        <Button variant="outlined">Top Center</Button>
      </Dropdown>
      <Dropdown menu={{ items }} placement="topRight">
        <Button variant="outlined">Top Right</Button>
      </Dropdown>
    </Space>

    <Space wrap>
      <Dropdown menu={{ items }} placement="bottomLeft">
        <Button variant="outlined">Bottom Left</Button>
      </Dropdown>
      <Dropdown menu={{ items }} placement="bottom">
        <Button variant="outlined">Bottom Center</Button>
      </Dropdown>
      <Dropdown menu={{ items }} placement="bottomRight">
        <Button variant="outlined">Bottom Right</Button>
      </Dropdown>
    </Space>
  </Space>
);

export default App;
