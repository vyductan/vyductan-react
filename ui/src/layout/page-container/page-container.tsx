import type { ReactNode } from "react";

import type { ResultProps } from "../../result";
import type { PageHeaderProps } from "../page-header";
import { cn } from "../..";
import { Result } from "../../result/result";
import { useUiConfig } from "../../store";
import { PageHeader } from "../page-header";

export type PageContainerProps = {
  children: ReactNode;
  header?: PageHeaderProps;
  className?: string;
  classNames?: {
    content?: string;
  };
  loading?: boolean;
  loadingRender?: ReactNode;
  exception?: boolean | ResultProps;
};
export const PageContainer = ({
  children,
  header,
  className,
  classNames,
  loading = false,
  loadingRender = <>Loading...</>,
  exception = false,
}: PageContainerProps) => {
  const { layout } = useUiConfig((s) => s.components);
  const mergedLoadingRender =
    layout?.pageContainer?.loadingRender ?? loadingRender;

  return (
    <div
      className={cn(
        "@container",
        "flex flex-1 flex-col gap-4 p-4 pb-10 lg:p-6 xl:p-8",
        className,
      )}
    >
      <>
        {header && <PageHeader {...header} />}
        <div className={cn("relative h-full space-y-8", classNames?.content)}>
          {loading ? (
            <>{mergedLoadingRender}</>
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
      </>
    </div>
  );
};
