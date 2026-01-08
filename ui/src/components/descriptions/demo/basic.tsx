import type React from "react";

import type { DescriptionsProps } from "@acme/ui/components/descriptions";
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
    label: "First Name",
    children: "John",
  },
  {
    key: "5",
    label: "Last Name",
    children: "Doe",
    span: 2,
  },
  {
    key: "6",
    label: "Remark",
    children: "empty",
  },
  {
    key: "7",
    label: "Address",
    children: "No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China",
  },
];

const App: React.FC = () => <Descriptions title="User Info" items={items} />;

export default App;
