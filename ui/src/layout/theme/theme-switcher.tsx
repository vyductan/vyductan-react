"use client";

import type { ButtonProps } from "@/components/ui/button";
import * as React from "react";
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
              label: "filled",
              onSelect: () => {
                setTheme("filled");
              },
            },
            {
              label: "Dark",
              onSelect: () => {
                setTheme("dark");
              },
            },
            {
              label: "System",
              onSelect: () => {
                setTheme("system");
              },
            },
          ],
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
