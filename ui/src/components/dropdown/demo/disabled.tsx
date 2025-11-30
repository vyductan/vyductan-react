import type { MenuProps } from "@acme/ui/components/menu";
import type React from "react";
import { Button } from "@acme/ui/components/button";
import { Dropdown } from "@acme/ui/components/dropdown";
import { Space } from "@acme/ui/components/space";

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
