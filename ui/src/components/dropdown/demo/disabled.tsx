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
      <Dropdown menu={{ items }}>
        <Button variant="outlined">Normal</Button>
      </Dropdown>

      <Dropdown menu={{ items }} disabled>
        <Button variant="outlined">Disabled</Button>
      </Dropdown>

      <Dropdown menu={{ items }} trigger={["hover"]} disabled>
        <Button variant="outlined">Disabled Hover</Button>
      </Dropdown>
    </Space>
  </Space>
);

export default App;
