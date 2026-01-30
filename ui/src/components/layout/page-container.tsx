"use client";

import type { ReactNode } from "react";

import { cn } from "@acme/ui/lib/utils";

import type { PageContentProps } from "./page-content";
import type { PageHeaderProps } from "./page-header";
import { useComponentConfig } from "../config-provider";
import { PageContent } from "./page-content";
import { PageHeader } from "./page-header";

export type PageContainerProps = {
  children?: ReactNode;
  header?: PageHeaderProps;
  className?: string;
  classNames?: {
    content?: string;
  };
  loading?: boolean;
  loadingRender?: ReactNode;
  exception?: PageContentProps["exception"];
};
export const PageContainer = ({
  children,
  header,
  className,
  classNames,
  loading = false,
  loadingRender,
  exception = false,
}: PageContainerProps) => {
  const { pageContainer } = useComponentConfig("layout");
  const defaultLoadingRender = loadingRender ??
    pageContainer?.loadingRender ?? <>Loading...</>;

  // Check if legacy props are provided to use legacy mode
  // Prioritize legacy mode if header or PageContent-related props are present
  const useLegacyMode =
    header !== undefined || loading === true || exception !== false;

  return (
    <div
      className={cn(
        "@container",
        "flex flex-1 flex-col gap-4 p-4 pb-10 lg:p-6",
        className,
      )}
    >
      {useLegacyMode ? (
        <>
          {header && <PageHeader {...header} />}
          <PageContent
            className={classNames?.content}
            loading={loading}
            loadingRender={defaultLoadingRender}
            exception={exception}
          >
            {children}
          </PageContent>
        </>
      ) : (
        children
      )}
    </div>
  );
};
