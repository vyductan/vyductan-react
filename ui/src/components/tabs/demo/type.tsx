"use client";

import type React from "react";
import { Space } from "@/components/ui/space";
import { Tabs } from "@/components/ui/tabs";

const items = [
  { key: "1", label: "Tab 1", children: "Content of Tab 1" },
  { key: "2", label: "Tab 2", children: "Content of Tab 2" },
  { key: "3", label: "Tab 3", children: "Content of Tab 3" },
];

const App: React.FC = () => (
  <Space direction="vertical" size="large" className="w-full">
    <div>
      <h3 className="mb-2 text-sm font-medium">Line (default)</h3>
      <Tabs defaultActiveKey="1" type="line" items={items} />
    </div>

    <div>
      <h3 className="mb-2 text-sm font-medium">Card</h3>
      <Tabs defaultActiveKey="1" type="card" items={items} />
    </div>

    <div>
      <h3 className="mb-2 text-sm font-medium">Solid</h3>
      <Tabs defaultActiveKey="1" type="solid" items={items} />
    </div>
  </Space>
);

export default App;
