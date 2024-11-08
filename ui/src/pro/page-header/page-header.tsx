// import { ArrowLeftOutlined, ArrowRightOutlined } from "@acme/ui/icons";

import type { AvatarProps } from "../../avatar";
import type { TagProps } from "../../tag";
import { cn } from "../..";
import { Avatar } from "../../avatar";

type PageHeaderProps = {
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  backIcon?: React.ReactNode;
  extra?: React.ReactNode;
  avatar?: AvatarProps;
  tags?: React.ReactElement<TagProps> | React.ReactElement<TagProps>[];
  onBack?: (event?: React.MouseEvent<HTMLElement>) => void;
};

const Title = (props: PageHeaderProps) => {
  const { title, avatar, subTitle, tags, extra } = props;
  const hasHeading = title ?? subTitle ?? tags ?? extra;
  // If there is nothing, return a null
  if (!hasHeading) {
    return;
  }
  // const backIcon = getBackIcon(props, direction);
  // const backIconDom = renderBack(backIcon, onBack);
  return (
    <div className={cn("flex justify-between")}>
      <div className="">
        {/* {backIconDom} */}
        {avatar && <Avatar className={cn(avatar.className)} {...avatar} />}
        {title && (
          <h3
            title={typeof title === "string" ? title : undefined}
            className="text-xl font-semibold dark:text-white dark:hover:text-white"
          >
            {title}
          </h3>
        )}
        {subTitle && (
          <span title={typeof subTitle === "string" ? subTitle : undefined}>
            {subTitle}
          </span>
        )}
        {tags && <span>{tags}</span>}
      </div>
      {extra && (
        <span>
          <div>{extra}</div>
        </span>
      )}
    </div>
  );
};
const renderChildren = (props: PageHeaderProps) => {
  const { children } = props;
  if (!children) {
    return;
  }
  return <div>{children}</div>;
};

const PageHeader = (props: PageHeaderProps) => {
  const {
    // style,
    // footer,
    // children,
    // breadcrumb,
    // breadcrumbRender,
    className,
    // contentWidth,
    // layout,
  } = props;

  const children = renderChildren(props);

  return (
    <div className={cn("pb-5", className)}>
      <Title {...props} />
      {children}
    </div>
  );
};

export { PageHeader };
export type { PageHeaderProps };
