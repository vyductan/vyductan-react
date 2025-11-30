"use client";

import { useState } from "react";
import { Icon } from "@acme/ui/icons";
import { Button } from "@acme/ui/components/button";
import { CodeBlock } from "@acme/ui/components/code-block";
import { cn } from "@acme/ui/lib/utils";

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
      <div data-slot="code-box-demo" className="py-4">
        {component}
      </div>

      <div className="flex items-center justify-center border-t px-6 py-3">
        <Button variant="text" onClick={toggleCodeCollapse}>
          <Icon
            icon="icon-[lucide--code]"
            className={cn(
              "transition-transform duration-200",
              !isCodeCollapsed && "rotate-180",
            )}
          />
          <span className="ml-2">
            {isCodeCollapsed ? "Show code" : "Hide code"}
          </span>
        </Button>
      </div>
      <div
        className={cn(
          "relative overflow-hidden transition-all duration-300 ease-in-out",
          isCodeCollapsed ? "max-h-0 opacity-0" : "max-h-[5000px] opacity-100",
        )}
      >
        <CodeBlock language={language}>{content}</CodeBlock>
      </div>
    </>
  );
};
