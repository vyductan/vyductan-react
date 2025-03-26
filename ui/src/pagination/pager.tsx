import type { PaginationProps } from "./pagination";
import { PaginationItem, PaginationLink } from "./_components";

type PagerProps = Pick<PaginationProps, "itemRender"> & {
  showTitle: boolean;
  className?: string;

  page: number;
  active?: boolean;
  onClick?: (page: number) => void;
  onKeyPress?: (
    e: React.KeyboardEvent<HTMLLIElement>,
    onClick: PagerProps["onClick"],
    page: PagerProps["page"],
  ) => void;

  hrefGenerator?: (page: number) => string;
};

const Pager = ({
  showTitle,
  className,

  page,
  active,
  onClick,
  onKeyPress,
  itemRender,
  hrefGenerator,
}: PagerProps) => {
  const handleClick = () => {
    onClick?.(page);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLLIElement>) => {
    onKeyPress?.(e, onClick, page);
  };

  const originalElement = (
    <PaginationLink isActive={active} href={hrefGenerator?.(page)}>
      {page}
    </PaginationLink>
  );
  const pager = itemRender ? (
    <PaginationLink isActive={active} asChild>
      {itemRender(page, "page", originalElement)}
    </PaginationLink>
  ) : (
    originalElement
  );

  return (
    <PaginationItem
      title={showTitle ? String(page) : undefined}
      className={className}
      onClick={handleClick}
      onKeyDown={handleKeyPress}
      tabIndex={0}
    >
      {pager}
    </PaginationItem>
  );
};

export type { PagerProps };
export { Pager };
