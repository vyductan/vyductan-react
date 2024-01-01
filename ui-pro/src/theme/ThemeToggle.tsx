"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import { Icon } from "@vyductan/icons";
import { Button, Dropdown } from "@vyductan/ui";

function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <Dropdown
      asChild
      placement="top"
      menu={{
        items: [
          {
            label: "Light",
            onClick: () => {
              setTheme("light");
            },
          },
          {
            label: "Dark",
            onClick: () => {
              setTheme("dark");
            },
          },
          {
            label: "System",
            onClick: () => {
              setTheme("system");
            },
          },
        ],
      }}
    >
      <Button
        icon={
          <>
            <Icon
              icon="radix-icons:sun"
              className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
            />
            <Icon
              icon="radix-icons:moon"
              className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
            />
            <span className="sr-only">Toggle theme</span>
          </>
        }
      />
    </Dropdown>
  );
}

export { ThemeToggle };
