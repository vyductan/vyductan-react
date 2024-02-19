"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import { Icon } from "@vyductan/icons";
import { Button, Dropdown } from "@vyductan/ui";

function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <>
      <Dropdown
        asChild
        placement="top"
        menu={{
          items: [
            {
              label: "Light",
              onSelect: () => {
                setTheme("light");
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
            <>
              <Icon
                icon="radix-icons:sun"
                className="block size-4 rotate-0 transition-all dark:hidden dark:-rotate-90"
              />
              <Icon
                icon="radix-icons:moon"
                className="hidden size-4 rotate-90 transition-all dark:block dark:rotate-0"
              />
              <span className="sr-only">Toggle theme</span>
            </>
          }
        />
      </Dropdown>
    </>
  );
}

export { ThemeToggle };
