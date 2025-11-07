"use client";

import type { ItemType } from "@/components/ui/menu";
import type React from "react";
import { Menu } from "@/components/ui/menu";
import { AppWindow, Mail, Settings } from "lucide-react";

const items: ItemType[] = [
  {
    key: "sub1",
    type: "submenu",
    icon: <Mail className="size-4" />,
    label: "Navigation One",
    children: [
      {
        key: "1-1",
        label: "Item 1",
        type: "group",
        children: [
          { key: "1", type: "item", label: "Option 1" },
          { key: "2", type: "item", label: "Option 2" },
        ],
      },
      {
        key: "1-2",
        label: "Item 2",
        type: "group",
        children: [
          { key: "3", type: "item", label: "Option 3" },
          { key: "4", type: "item", label: "Option 4" },
        ],
      },
    ],
  },
  {
    key: "sub2",
    type: "submenu",
    icon: <AppWindow className="size-4" />,
    label: "Navigation Two",
    children: [
      { key: "5", type: "item", label: "Option 5" },
      { key: "6", type: "item", label: "Option 6" },
      {
        key: "sub3",
        type: "submenu",
        label: "Submenu",
        children: [
          { key: "7", type: "item", label: "Option 7" },
          { key: "8", type: "item", label: "Option 8" },
        ],
      },
    ],
  },
  {
    key: "sub4",
    type: "submenu",
    label: "Navigation Three",
    icon: <Settings className="size-4" />,
    children: [
      { key: "9", type: "item", label: "Option 9" },
      { key: "10", type: "item", label: "Option 10" },
      { key: "11", type: "item", label: "Option 11" },
      { key: "12", type: "item", label: "Option 12" },
    ],
  },
];

const App: React.FC = () => {
  return (
    <Menu
      onSelect={(args) => {
        console.log("click", args);
      }}
      className="w-64"
      mode="vertical"
      items={items}
    />
  );
};

export default App;
