import type { MenuProps } from "@acme/ui/components/menu";
import type React from "react";
import { Icon } from "@acme/ui/icons";
import { Dropdown } from "@acme/ui/components/dropdown";
import { Space } from "@acme/ui/components/space";

const items: MenuProps["items"] = [
  {
    key: "my-account",
    label: "My Account",
    type: "group",
    children: [
      {
        key: "my-account-profile",
        label: "Profile",
      },
      {
        key: "settings",
        label: (
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.antgroup.com"
          >
            Settings
          </a>
        ),
      },
    ],
  },
  {
    type: "divider",
  },
  {
    key: "2",
    label: "Teams",
    icon: <Icon icon="icon-[lucide--smile]" className="size-4" />,
  },
  {
    key: "invate-users",
    label: "Invate Users",
    children: [
      {
        key: "invate-user-email",
        label: "Email",
      },
      {
        key: "invate-user-message",
        label: "Message",
      },
      {
        type: "divider",
      },
      {
        key: "invate-user-more",
        label: "More...",
      },
    ],
  },
  {
    key: "3",
    label: "New Team",
    extra: "⌘N",
  },
  {
    type: "divider",
  },
  {
    key: "4",
    label: "Disabled",
    disabled: true,
  },
  {
    key: "5",
    danger: true,
    label: "Danger",
  },
];

const App: React.FC = () => (
  <Dropdown menu={{ items }} trigger={["click"]}>
    <a onClick={(e) => e.preventDefault()}>
      <Space>
        Hover me
        <Icon icon="icon-[lucide--chevron-down]" className="size-4" />
      </Space>
    </a>
  </Dropdown>
);

export default App;
