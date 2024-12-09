import type { ReactNode } from "react";

import type { PageHeaderProps } from "../page-header";
import { cn } from "../..";
import { useUi } from "../../store";
import { PageHeader } from "../page-header";

export type PageContainerProps = {
  children: ReactNode;
  header?: PageHeaderProps;
  className?: string;
  classNames?: {
    content?: string;
  };
  loading?: boolean;
  loadingIcon?: ReactNode;
  exception?: boolean;
  exceptionRender?: ReactNode;
};
export const PageContainer = ({
  children,
  header,
  className,
  classNames,
  loading = false,
  loadingIcon = <>Loding...</>,
  exception = false,
  exceptionRender = <>Error</>,
}: PageContainerProps) => {
  const { componentConfig } = useUi();
  const mergedLoadingIconConfig =
    componentConfig?.layout?.pageContainer?.loadingIcon ?? loadingIcon;

  return (
    <main
      className={cn(
        "mx-auto w-full max-w-screen-lg",
        "flex flex-1 flex-col p-4 lg:p-6 xl:p-8",
        "space-y-8",
        className,
      )}
    >
      <>
        {header && <PageHeader {...header} />}
        <div className={cn("relative space-y-8", classNames?.content)}>
          {loading ? (
            <div className="flex items-center justify-center">
              {mergedLoadingIconConfig}
            </div>
          ) : exception ? (
            <>{exceptionRender}</>
          ) : (
            <>{children}</>
          )}
        </div>
      </>
    </main>
  );
};
