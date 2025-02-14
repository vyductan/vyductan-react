import type { ReactNode } from "react";

import { Icon } from "../icons";
import { useUiConfig } from "../store";

type ResultProps = {
  status?: "success" | "info" | "warning" | "error" | "500";
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  extra?: React.ReactNode;
};
const Result = ({ status, title, subtitle, extra }: ResultProps) => {
  const { result } = useUiConfig((s) => s.components);
  let icon: ReactNode = <></>;
  switch (status) {
    case "success": {
      icon = <Icon icon="icon-[ep--success-filled]" />;
      break;
    }
    case "info": {
      icon = <Icon icon="icon-[si--info-fill]" />;
      break;
    }
    case "warning": {
      icon = <Icon icon="icon-[mingcute--warning-fill]" />;
      break;
    }
    case "error": {
      icon = <Icon icon="icon-[ix--error-filled]" />;
      break;
    }
    case "500": {
      icon = result[500] ? (
        result[500].icon
      ) : (
        <Icon icon="icon-[ix--error-filled]" />
      );
      title = title ?? (result[500] ? result[500].title : "500");
      subtitle = (
        <div className="text-muted-foreground">
          {subtitle ??
            (result[500] ? result[500].subtitle : "Something went wrong")}
        </div>
      );
      extra = extra ?? (result[500] ? result[500].extra : <></>);
      break;
    }
  }

  return (
    <div>
      {icon}
      {title}
      {subtitle}
      {extra}
    </div>
  );
};

export type { ResultProps };
export { Result };
