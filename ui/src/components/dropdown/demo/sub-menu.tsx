import type React from "react";

import type { MenuProps } from "@acme/ui/components/menu";
import { Dropdown } from "@acme/ui/components/dropdown";
import { Space } from "@acme/ui/components/space";
import { Icon } from "@acme/ui/icons";

const items: MenuProps["items"] = [
  {
    key: "1",
    type: "group",
    label: "Group title",
    children: [
      {
        key: "1-1",
        label: "1st menu item",
      },
      {
        key: "1-2",
        label: "2nd menu item",
      },
    ],
  },
  {
    key: "2",
    label: "sub menu",
    children: [
      {
        key: "2-1",
        label: "3rd menu item",
      },
      {
        key: "2-2",
        label: "4th menu item",
      },
    ],
  },
  {
    key: "3",
    label: "disabled sub menu",
    disabled: true,
    children: [
      {
        key: "3-1",
        label: "5d menu item",
      },
      {
        key: "3-2",
        label: "6th menu item",
      },
    ],
  },
];

const App: React.FC = () => (
  <Dropdown menu={{ items }}>
    <a onClick={(e) => e.preventDefault()}>
      <Space>
        Cascading menu
        <Icon icon="icon-[lucide--chevron-down]" className="size-4" />
      </Space>
    </a>
  </Dropdown>
);

export default App;
