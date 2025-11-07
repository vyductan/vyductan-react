"use client";

import type { ButtonProps } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { useTheme } from "next-themes";

import { Icon } from "@acme/ui/icons";

function ThemeSwitcher(props: ButtonProps) {
  const { theme, systemTheme, setTheme } = useTheme();

  return (
    <>
      <Dropdown
        asChild
        placement="top"
        menu={{
          items: [
            {
              key: "filled",
              type: "item",
              label: "filled",
            },
            {
              key: "dark",
              type: "item",
              label: "Dark",
            },
            {
              key: "system",
              type: "item",
              label: "System",
            },
          ],
          onSelect: ({ key }) => {
            if (key === "filled" || key === "dark" || key === "system") {
              setTheme(key);
            }
          },
        }}
      >
        <Button
          shape="circle"
          icon={
            theme === "dark" ||
            (theme === "system" && systemTheme === "dark") ? (
              <Icon icon="icon-[radix-icons--moon]" />
            ) : (
              <Icon icon="icon-[radix-icons--sun]" />
            )
          }
          variant="text"
          aria-label={theme === "dark" ? "Light mode" : "Dark mode"}
          title={theme === "dark" ? "Light mode" : "Dark mode"}
          {...props}
        />
      </Dropdown>
    </>
  );
}

export { ThemeSwitcher as ThemeToggle };
