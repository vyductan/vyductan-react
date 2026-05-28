import type React from "react";
import { Building2 } from "lucide-react";

import type { DescriptionsProps } from "@acme/ui/components/descriptions";
import { Badge } from "@acme/ui/components/badge";
import { Descriptions } from "@acme/ui/components/descriptions";

const items: DescriptionsProps["items"] = [
  {
    key: "1",
    label: "UserName",
    children: "Zhou Maomao",
  },
  {
    key: "2",
    label: "Telephone",
    children: "1810000000",
  },
  {
    key: "3",
    label: "Live",
    children: "Hangzhou, Zhejiang",
  },
  {
    key: "4",
    label: (
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4" />
        <span>Phòng ban</span>
      </div>
    ),
    span: 2,
    children: "No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China",
  },
  {
    key: "5",
    label: (
      <div className="flex items-center gap-2">
        <Badge variant="outline">New</Badge>
        <span>Remark</span>
      </div>
    ),
    children: "empty",
  },
];

const App: React.FC = () => (
  <Descriptions title="User Info" layout="vertical" items={items} />
);

export default App;
