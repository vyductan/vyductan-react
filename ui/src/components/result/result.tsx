import type { ReactNode } from "react";

import { Icon } from "../../icons";
import { cn } from "../../lib/utils";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../../shadcn/empty";

type ResultProps = {
  status?: "success" | "info" | "warning" | "error" | "500" | "404";
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  extra?: React.ReactNode;
  className?: string;
  icons?: {
    success?: React.ReactNode;
    info?: React.ReactNode;
    warning?: React.ReactNode;
    error?: React.ReactNode;
    500?: React.ReactNode;
    404?: React.ReactNode;
  };
};

const defaultIcons = {
  success: <Icon icon="icon-[ep--success-filled]" />,
  info: <Icon icon="icon-[si--info-fill]" />,
  warning: <Icon icon="icon-[mingcute--warning-fill]" />,
  error: <Icon icon="icon-[ix--error-filled]" />,
  500: <Icon icon="icon-[ix--error-filled]" />,
  404: <Icon icon="icon-[lucide--message-square-warning]" />,
};
const Result = ({
  status,
  title,
  subTitle,
  extra,
  className,
  icons = defaultIcons,
}: ResultProps) => {
  let icon: ReactNode = <></>;
  let iconColor = "";
  let titleColor = "";
  let defaultTitle = "";
  let defaultSubTitle = "";

  switch (status) {
    case "success": {
      icon = icons.success ?? defaultIcons.success;
      iconColor = "text-green-600 dark:text-green-400";
      titleColor = "text-foreground";
      break;
    }
    case "info": {
      icon = icons.info ?? defaultIcons.info;
      iconColor = "text-blue-600 dark:text-blue-400";
      titleColor = "text-foreground";
      break;
    }
    case "warning": {
      icon = icons.warning ?? defaultIcons.warning;
      iconColor = "text-amber-600 dark:text-amber-400";
      titleColor = "text-foreground";
      break;
    }
    case "error": {
      icon = icons.error ?? defaultIcons.error;
      iconColor = "text-red-600 dark:text-red-400";
      titleColor = "text-foreground";
      break;
    }
    case "500": {
      icon = icons[500] ?? defaultIcons[500];
      iconColor = "text-red-600 dark:text-red-400";
      titleColor = "text-foreground";
      defaultTitle = "500";
      defaultSubTitle = "Something went wrong";
      break;
    }
    case "404": {
      icon = icons[404] ?? defaultIcons[404];
      iconColor = "text-muted-foreground";
      titleColor = "text-foreground";
      defaultTitle = "404";
      defaultSubTitle = "Page not found";
      break;
    }
  }

  const displayTitle = title ?? defaultTitle;
  const displaySubTitle = subTitle ?? defaultSubTitle;

  return (
    <Empty className={cn(className)} role="status" aria-live="polite">
      <EmptyHeader>
        <EmptyMedia variant="icon" className={cn(iconColor)}>
          {icon}
        </EmptyMedia>
        {displayTitle && (
          <EmptyTitle className={cn(titleColor)}>{displayTitle}</EmptyTitle>
        )}
        {displaySubTitle && (
          <EmptyDescription>{displaySubTitle}</EmptyDescription>
        )}
      </EmptyHeader>
      {extra && <EmptyContent>{extra}</EmptyContent>}
    </Empty>
  );
};

export type { ResultProps };
export { Result };
