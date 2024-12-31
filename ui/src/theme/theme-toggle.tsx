"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import type { ButtonProps } from "../button";
import { Button } from "../button";
import { Dropdown } from "../dropdown";
import { Icon } from "../icons";

function ThemeToggle(props: ButtonProps) {
  const { theme, systemTheme, setTheme } = useTheme();

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
            theme === "dark" ||
            (theme === "system" && systemTheme === "dark") ? (
              <Icon icon="icon-[radix-icons--moon]" />
            ) : (
              <Icon icon="icon-[radix-icons--sun]" />
            )
          }
          variant="ghost"
          aria-label={theme === "dark" ? "Light mode" : "Dark mode"}
          title={theme === "dark" ? "Light mode" : "Dark mode"}
          {...props}
        />
      </Dropdown>
    </>
  );
}

export { ThemeToggle };
