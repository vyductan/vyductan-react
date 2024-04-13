import type { AvatarProps } from "@acme/ui/avatar";
import type { TagProps } from "@acme/ui/tag";
import type { Direction } from "@acme/ui/types";
import { clsm } from "@acme/ui";
import { Avatar } from "@acme/ui/avatar";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@acme/ui/icons";

type PageHeaderProps = {
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  backIcon?: React.ReactNode;
  extra?: React.ReactNode;
  avatar?: AvatarProps;
  tags?: React.ReactElement<TagProps> | React.ReactElement<TagProps>[];
  onBack?: (e?: React.MouseEvent<HTMLElement>) => void;
};

const getBackIcon = (props: PageHeaderProps, direction: Direction = "ltr") => {
  if (props.backIcon !== undefined) {
    return props.backIcon;
  }
  return direction === "rtl" ? <ArrowRightOutlined /> : <ArrowLeftOutlined />;
};

const renderBack = (
  backIcon?: React.ReactNode,
  onBack?: (e?: React.MouseEvent<HTMLElement>) => void,
) => {
  if (!backIcon || !onBack) {
    return null;
  }
  return (
    <div>
      <div
        role="button"
        onClick={(e) => {
          onBack(e);
        }}
        className=""
        aria-label="back"
      >
        {backIcon}
      </div>
    </div>
  );
};

const renderTitle = (props: PageHeaderProps, direction: Direction = "ltr") => {
  const { title, avatar, subTitle, tags, extra, onBack } = props;
  const hasHeading = title ?? subTitle ?? tags ?? extra;
  // If there is nothing, return a null
  if (!hasHeading) {
    return null;
  }
  const backIcon = getBackIcon(props, direction);
  const backIconDom = renderBack(backIcon, onBack);
  return (
    <div className={clsm("flex justify-between")}>
      <div className="">
        {backIconDom}
        {avatar && <Avatar className={clsm(avatar.className)} {...avatar} />}
        {title && (
          <span title={typeof title === "string" ? title : undefined}>
            {title}
          </span>
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
    return null;
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

  const title = renderTitle(props);
  const children = renderChildren(props);

  return (
    <div className={className}>
      {title}
      {children}
    </div>
  );
};

export { PageHeader };
export type { PageHeaderProps };
