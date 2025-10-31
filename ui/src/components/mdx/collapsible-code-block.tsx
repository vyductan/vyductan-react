"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { cn } from "@/lib/utils";

type CollapsibleCodeBlockProps = {
  component: React.ReactNode;
  language: string;
  content: string;
};

export const CollapsibleCodeBlock = ({
  component,
  language,
  content,
}: CollapsibleCodeBlockProps) => {
  const [isCodeCollapsed, setIsCodeCollapsed] = useState(true);

  const toggleCodeCollapse = () => {
    setIsCodeCollapsed((prev) => !prev);
  };

  return (
    <>
      <div className="flex items-center justify-between px-6 py-4">
        <div>{component}</div>

        <Button variant="text" onClick={toggleCodeCollapse}>
          <Icon
            icon="icon-[lucide--code]"
            className={cn(
              "transition-transform duration-200",
              isCodeCollapsed && "rotate-180",
            )}
          />
          <span className="sr-only">
            {isCodeCollapsed ? "Show code" : "Hide code"}
          </span>
        </Button>
      </div>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isCodeCollapsed ? "max-h-0 opacity-0" : "max-h-[5000px] opacity-100",
        )}
      >
        <CodeBlock language={language}>{content}</CodeBlock>
      </div>
    </>
  );
};
