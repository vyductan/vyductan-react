"use client";

import * as React from "react";

import { useAtBottom } from "@vyductan/hooks";
import { ArrowDownFilled } from "@vyductan/icons";
import { clsm } from "@vyductan/utils";

import type { ButtonProps } from "../button";
import { Button } from "../button";

export const ButtonScrollToBottom = ({ className, ...props }: ButtonProps) => {
  const isAtBottom = useAtBottom();

  return (
    <Button
      className={clsm(
        "absolute right-4 top-1 z-10 bg-background transition-opacity duration-300 sm:right-8 md:top-2",
        isAtBottom ? "opacity-0" : "opacity-100",
        className,
      )}
      icon={
        <>
          <ArrowDownFilled />
          <span className="sr-only">Scroll to bottom</span>
        </>
      }
      onClick={() =>
        window.scrollTo({
          top: document.body.offsetHeight,
          behavior: "smooth",
        })
      }
      {...props}
    />
  );
};
