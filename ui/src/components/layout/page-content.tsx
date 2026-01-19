import type { ReactNode } from "react";

import { cn } from "@acme/ui/lib/utils";

import type { ResultProps } from "../result";
import { Result } from "../result/result";

export type PageContentProps = {
  children?: ReactNode;
  className?: string;
  loading?: boolean;
  loadingRender?: ReactNode;
  exception?: boolean | ResultProps;
};

export const PageContent = ({
  children,
  className,
  loading = false,
  loadingRender = <>Loading...</>,
  exception = false,
}: PageContentProps) => {
  return (
    <div className={cn("relative h-full space-y-8", className)}>
      {loading ? (
        <>{loadingRender}</>
      ) : exception ? (
        <div className="absolute inset-x-0 top-0 flex items-center justify-center p-10">
          {typeof exception === "boolean" ? (
            <Result status="500" />
          ) : (
            <Result {...exception} />
          )}
        </div>
      ) : (
        <>{children}</>
      )}
    </div>
  );
};
