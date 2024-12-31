import { NavigationLeft } from "./navigation-left";
import { NavigationRight } from "./navigation-right";

type PanelProps = {
  title?: React.ReactNode;
  children?: React.ReactNode;
  topbar?: boolean;

  classNames?: {
    content?: string;
  };
  onNavigationLeftClick: () => void;
  onNavigationRightClick: () => void;
};
export const Panel = ({
  title,
  children,
  topbar = true,
  classNames,
  onNavigationLeftClick,
  onNavigationRightClick,
}: PanelProps) => {
  return (
    <div>
      {topbar && (
        <div className="flex items-center justify-between px-6 py-2">
          <NavigationLeft onClick={onNavigationLeftClick} />
          <div className="flex-1 text-center font-medium">{title}</div>
          <NavigationRight onClick={onNavigationRightClick} />
        </div>
      )}
      <div className={classNames?.content}>{children}</div>
    </div>
  );
};
