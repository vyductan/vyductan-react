import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import KeyCode from "rc-util/lib/KeyCode";

import type { PaginationItemProps } from "./_components";
import type { PaginationLocale } from "./types";
import { clsm } from "..";
import { Icon } from "../icons";
import {
  PaginationContent,
  // PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationRoot,
  PaginationTotal,
} from "./_components";
import enUS from "./locale/en_US";
import { usePagination } from "./usePagination";

export type PaginationProps = {
  className?: string;
  total: number;

  disabled?: boolean;
  hideOnSinglePage?: boolean;
  locale?: PaginationLocale;
  simple?: boolean;
  showLessItems?: boolean;
  showPrevNextJumpers?: boolean;
  showSizeChanger?: boolean;
  showTitle?: boolean;
  showTotal?: (total: number, range: [number, number]) => React.ReactNode;
  totalBoundaryShowSizeChanger?: number;

  itemRender?: (
    page: number,
    type: "page" | "prev" | "next" | "jump-prev" | "jump-next",
    originalElement: React.ReactNode,
  ) => React.ReactNode;
};
export const Pagination = (props: PaginationProps) => {
  const {
    className,
    total,

    disabled,
    hideOnSinglePage,
    locale = enUS,
    simple,
    showLessItems,
    showPrevNextJumpers = true,
    // showSizeChanger: showSizeChangerProp,
    showTitle,
    showTotal,
    // totalBoundaryShowSizeChanger = 50,

    itemRender = defaultItemRender,
  } = props;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { page: current, pageSize } = usePagination();

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const [internalInputVal, setInternalInputVal] = React.useState(current);

  React.useEffect(() => {
    setInternalInputVal(current);
  }, [current]);

  const jumpPrevPage = Math.max(1, current - (showLessItems ? 3 : 5));
  const jumpNextPage = Math.min(
    calculatePage(undefined, pageSize, total),
    current + (showLessItems ? 3 : 5),
  );

  function isValid(page: number) {
    return isInteger(page) && page !== current && isInteger(total) && total > 0;
  }

  function handleChange(page: number) {
    if (isValid(page) && !disabled) {
      const currentPage = calculatePage(undefined, pageSize, total);
      let newPage = page;
      if (page > currentPage) {
        newPage = currentPage;
      } else if (page < 1) {
        newPage = 1;
      }

      if (newPage !== internalInputVal) {
        setInternalInputVal(newPage);
      }

      router.push(createPageURL(newPage));

      return newPage;
    }

    return current;
  }

  const hasPrev = current > 1;
  const hasNext = current < calculatePage(undefined, pageSize, total);
  // const showSizeChanger =
  //   showSizeChangerProp ?? total > totalBoundaryShowSizeChanger;

  function jumpPrevHandle() {
    handleChange(jumpPrevPage);
  }

  function jumpNextHandle() {
    handleChange(jumpNextPage);
  }

  function runIfEnter(
    event: React.KeyboardEvent<HTMLLIElement>,

    callback: (...params: any[]) => void,

    ...restParams: any[]
  ) {
    if (
      event.key === "Enter" ||
      event.code === KeyCode.ENTER.toString()
      // event..keyCode === KeyCode.ENTER
    ) {
      callback(...restParams);
    }
  }

  function runIfEnterJumpPrev(event: React.KeyboardEvent<HTMLLIElement>) {
    runIfEnter(event, jumpPrevHandle);
  }

  function runIfEnterJumpNext(event: React.KeyboardEvent<HTMLLIElement>) {
    runIfEnter(event, jumpNextHandle);
  }

  let jumpPrev: React.ReactElement<PaginationItemProps> = <></>;

  // const dataOrAriaAttributeProps = pickAttrs(props, {
  //   aria: true,
  //   data: true,
  // });

  const totalText = showTotal && (
    <PaginationTotal>
      {showTotal(total, [
        total === 0 ? 0 : (current - 1) * pageSize + 1,
        current * pageSize > total ? total : current * pageSize,
      ])}
    </PaginationTotal>
  );

  let jumpNext: React.ReactElement<PaginationItemProps> = <></>;

  const allPages = calculatePage(undefined, pageSize, total);

  // ================== Render ==================
  // When hideOnSinglePage is true and there is only 1 page, hide the pager
  if (hideOnSinglePage && total <= pageSize) {
    return null;
  }
  // ====================== Normal ======================
  const pagerList: React.ReactElement<PaginationItemProps>[] = [];

  const prevPage = current - 1 > 0 ? current - 1 : 0;
  const nextPage = current + 1 < allPages ? current + 1 : allPages;
  const pageBufferSize = showLessItems ? 1 : 2;
  if (allPages <= 3 + pageBufferSize * 2) {
    if (!allPages) {
      pagerList.push(
        <PaginationItem
          ref={null}
          key="noPager"
          // className={`${prefixCls}-item-disabled`}
        >
          <PaginationLink href={createPageURL(1)}>1</PaginationLink>
        </PaginationItem>,
      );
    }

    for (let i = 1; i <= allPages; i += 1) {
      pagerList.push(
        <PaginationItem ref={null} key={i}>
          <PaginationLink href={createPageURL(i)} isActive={current === i}>
            {i}
          </PaginationLink>
        </PaginationItem>,
      );
    }
  } else {
    const prevItemTitle = showLessItems ? locale.prev_3 : locale.prev_5;
    const nextItemTitle = showLessItems ? locale.next_3 : locale.next_5;

    const jumpPrevContent = itemRender?.(
      jumpPrevPage,
      "jump-prev",
      <Icon
        icon="icon-[heroicons-solid--chevron-double-left]"
        aria-label="prev page"
      />,
    );
    const jumpNextContent = itemRender?.(
      jumpNextPage,
      "jump-next",
      <Icon
        icon="icon-[heroicons-solid--chevron-double-right]"
        aria-label="next page"
      />,
    );

    if (showPrevNextJumpers) {
      jumpPrev = jumpPrevContent ? (
        <li
          title={showTitle ? prevItemTitle : undefined}
          key="prev"
          onClick={() => {
            handleChange(jumpPrevPage);
          }}
          onKeyDown={runIfEnterJumpPrev}
          // tabIndex={0}
          role="presentation"
          // className={classNames(`${prefixCls}-jump-prev`, {
          //   [`${prefixCls}-jump-prev-custom-icon`]: !!jumpPrevIcon,
          // })}
        >
          {jumpPrevContent}
        </li>
      ) : (
        <></>
      );

      jumpNext = jumpNextContent ? (
        <li
          title={showTitle ? nextItemTitle : undefined}
          key="next"
          onClick={jumpNextHandle}
          onKeyDown={runIfEnterJumpNext}
          // tabIndex={0}
          role="presentation"
          // className={classNames(`${prefixCls}-jump-next`, {
          //   [`${prefixCls}-jump-next-custom-icon`]: !!jumpNextIcon,
          // })}
        >
          {jumpNextContent}
        </li>
      ) : (
        <></>
      );
    }

    let left = Math.max(1, current - pageBufferSize);
    let right = Math.min(current + pageBufferSize, allPages);

    if (current - 1 <= pageBufferSize) {
      right = 1 + pageBufferSize * 2;
    }
    if (allPages - current <= pageBufferSize) {
      left = allPages - pageBufferSize * 2;
    }

    for (let i = left; i <= right; i += 1) {
      pagerList.push(
        <PaginationItem ref={null} key={i}>
          <PaginationLink href={createPageURL(i)} isActive={current === i}>
            {i}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    if (current - 1 >= pageBufferSize * 2 && current !== 1 + 2) {
      pagerList[0] = React.cloneElement<PaginationItemProps>(pagerList[0]!, {
        // className: classNames(
        //   `${prefixCls}-item-after-jump-prev`,
        //   pagerList[0].props.className,
        // ),
      });

      pagerList.unshift(jumpPrev);
    }

    if (allPages - current >= pageBufferSize * 2 && current !== allPages - 2) {
      const lastOne = pagerList[pagerList.length - 1]!;
      pagerList[pagerList.length - 1] = React.cloneElement(lastOne, {
        // className: classNames(
        //   `${prefixCls}-item-before-jump-next`,
        //   lastOne.props.className,
        // ),
      });

      pagerList.push(jumpNext);
    }

    if (left !== 1) {
      pagerList.unshift(
        <PaginationItem key={1}>
          <PaginationLink href={createPageURL(1)}>1</PaginationLink>
        </PaginationItem>,
      );
    }
    if (right !== allPages) {
      pagerList.push(
        <PaginationItem key={allPages}>
          <PaginationLink href={createPageURL(allPages)}>
            {allPages}
          </PaginationLink>
        </PaginationItem>,
      );
    }
  }

  const prevDisabled = !hasPrev || !allPages;
  const prev = (
    <PaginationItem
      aria-disabled={prevDisabled}
      className={prevDisabled ? "cursor-not-allowed" : ""}
    >
      <PaginationPrevious
        href={createPageURL(prevPage)}
        shape="icon"
        disabled={prevDisabled}
      />
    </PaginationItem>
  );

  /*
   * Next Button
   */
  let nextDisabled: boolean;
  if (simple) {
    nextDisabled = !hasNext;
  } else {
    nextDisabled = !hasNext || !allPages;
  }
  const next = (
    <PaginationItem aria-disabled={nextDisabled}>
      <PaginationNext
        href={createPageURL(nextPage)}
        shape="icon"
        disabled={nextDisabled}
      />
    </PaginationItem>
  );

  return (
    <PaginationRoot className={clsm(className)}>
      <PaginationContent>
        {totalText}
        {prev}
        {pagerList}
        {next}
      </PaginationContent>
    </PaginationRoot>
  );
};

const defaultItemRender: PaginationProps["itemRender"] = (
  _page,
  _type,
  element,
) => element;

function isInteger(v: number) {
  const value = Number(v);
  return (
    typeof value === "number" &&
    !Number.isNaN(value) &&
    isFinite(value) &&
    Math.floor(value) === value
  );
}

function calculatePage(p: number | undefined, pageSize: number, total: number) {
  const _pageSize = typeof p === "undefined" ? pageSize : p;
  return Math.floor((total - 1) / _pageSize) + 1;
}
