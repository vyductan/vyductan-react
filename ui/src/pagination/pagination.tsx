import React from "react";
import { useMergedState } from "@rc-component/util";
import KeyCode from "@rc-component/util/lib/KeyCode";

import type { PaginationItemProps } from "./_components";
import type { SizeChangerRender } from "./_components/page-size-options";
import type { PagerProps } from "./pager";
import type { PaginationLocale } from "./types";
import { cn } from "..";
import { Icon } from "../icons";
import {
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationRoot,
  PaginationTotal,
} from "./_components";
import { PageSizeOptions } from "./_components/page-size-options";
import enUS from "./locale/en-us";
import { Pager } from "./pager";

export type PaginationProps = {
  className?: string;

  // control
  defaultPage?: number;
  defaultPageSize?: number;
  page?: number;
  pageSize?: number;
  total?: number;
  onChange?: (page: number, pageSize: number) => void;

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
  sizeChangerRender?: SizeChangerRender;
  pageSizeOptions?: number[];
  onShowSizeChange?: (page: number, pageSize: number) => void;

  itemRender?: (
    page: number,
    type: "page" | "prev" | "next" | "jump-prev" | "jump-next",
    originalElement: React.ReactNode,
  ) => React.ReactElement<{ children?: React.ReactNode }>;

  // hrefGenerator?: (page: number) => string;
};
export const Pagination = (props: PaginationProps) => {
  const {
    disabled,
    className,

    // control
    page: pageProp,
    defaultPage = 1,
    total = 0,
    pageSize: pageSizeProp = 10,
    defaultPageSize = 10,
    onChange,

    // config
    hideOnSinglePage,
    locale = enUS,
    simple,
    showLessItems,
    showPrevNextJumpers = true,
    showTitle = true,
    showTotal,
    totalBoundaryShowSizeChanger = 50,
    showSizeChanger = total > totalBoundaryShowSizeChanger,
    sizeChangerRender,
    pageSizeOptions,
    onShowSizeChange,

    itemRender,
    // itemRender = defaultItemRender,
    // hrefGenerator,
  } = props;

  const [pageSize, setPageSize] = useMergedState<number>(10, {
    value: pageSizeProp,
    defaultValue: defaultPageSize,
  });

  const [current, setCurrent] = useMergedState<number>(1, {
    value: pageProp,
    defaultValue: defaultPage,
    postState: (c) =>
      Math.max(1, Math.min(c, calculatePage(undefined, pageSize, total))),
  });

  const [internalInputValue, setInternalInputValue] = React.useState(current);

  React.useEffect(() => {
    setInternalInputValue(current);
  }, [current]);

  const jumpPrevPage = Math.max(1, current - (showLessItems ? 3 : 5));
  const jumpNextPage = Math.min(
    calculatePage(undefined, pageSize, total),
    current + (showLessItems ? 3 : 5),
  );

  function isValid(page: number) {
    return isInteger(page) && page !== current && isInteger(total) && total > 0;
  }

  function changePageSize(size: number) {
    const newCurrent = calculatePage(size, pageSize, total);
    const nextCurrent =
      current > newCurrent && newCurrent !== 0 ? newCurrent : current;

    setPageSize(size);
    setInternalInputValue(nextCurrent);
    onShowSizeChange?.(current, size);
    setCurrent(nextCurrent);
    onChange?.(nextCurrent, size);
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

      if (newPage !== internalInputValue) {
        setInternalInputValue(newPage);
      }

      setCurrent(newPage);
      onChange?.(newPage, pageSize);

      return newPage;
    }

    return current;
  }

  const hasPrev = current > 1;
  const hasNext = current < calculatePage(undefined, pageSize, total);

  function prevHandle() {
    if (hasPrev) handleChange(current - 1);
  }

  function nextHandle() {
    if (hasNext) handleChange(current + 1);
  }

  function jumpPrevHandle() {
    handleChange(jumpPrevPage);
  }

  function jumpNextHandle() {
    handleChange(jumpNextPage);
  }

  function runIfEnter(
    event: React.KeyboardEvent<HTMLLIElement>,

    callback: any,

    ...restParams: any[]
  ) {
    if (event.key === "Enter" || event.code === KeyCode.ENTER.toString()) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      callback(...restParams);
    }
  }

  function runIfEnterPrev(event: React.KeyboardEvent<HTMLLIElement>) {
    runIfEnter(event, prevHandle);
  }

  function runIfEnterNext(event: React.KeyboardEvent<HTMLLIElement>) {
    runIfEnter(event, nextHandle);
  }

  function runIfEnterJumpPrev(event: React.KeyboardEvent<HTMLLIElement>) {
    runIfEnter(event, jumpPrevHandle);
  }

  function runIfEnterJumpNext(event: React.KeyboardEvent<HTMLLIElement>) {
    runIfEnter(event, jumpNextHandle);
  }

  function renderPrev(prevPage: number) {
    const originalElement = (
      <PaginationPrevious href={generateHref(prevPage)} />
    );
    const prevButton = itemRender ? (
      <PaginationPrevious asChild>
        {itemRender(prevPage, "prev", originalElement)}
      </PaginationPrevious>
    ) : (
      originalElement
    );
    return React.isValidElement<HTMLButtonElement>(prevButton)
      ? React.cloneElement(prevButton, { disabled: !hasPrev })
      : prevButton;
  }

  function renderNext(nextPage: number) {
    const originalElement = <PaginationNext href={generateHref(nextPage)} />;
    const nextButton = itemRender ? (
      <PaginationNext asChild>
        {itemRender(nextPage, "next", originalElement)}
      </PaginationNext>
    ) : (
      originalElement
    );
    return React.isValidElement<HTMLButtonElement>(nextButton)
      ? React.cloneElement(nextButton, { disabled: !hasNext })
      : nextButton;
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
        Math.min(current * pageSize, total),
      ])}
    </PaginationTotal>
  );

  let jumpNext: React.ReactElement<PaginationItemProps> = <></>;

  const allPages = calculatePage(undefined, pageSize, total);

  // ================== Render ==================
  // When hideOnSinglePage is true and there is only 1 page, hide the pager
  if (hideOnSinglePage && total <= pageSize) {
    return;
  }

  const pagerProps: PagerProps = {
    onClick: handleChange,
    onKeyPress: runIfEnter,
    showTitle,
    itemRender,
    page: -1,
  };

  // ====================== Normal ======================
  const pagerList: React.ReactElement<PaginationItemProps>[] = [];

  const prevPage = Math.max(current - 1, 0);
  const nextPage = Math.min(current + 1, allPages);
  // ====================== Normal ======================
  const pageBufferSize = showLessItems ? 1 : 2;
  if (allPages <= 3 + pageBufferSize * 2) {
    if (!allPages) {
      pagerList.push(<Pager {...pagerProps} key="noPager" page={1} />);
    }

    for (let index = 1; index <= allPages; index += 1) {
      pagerList.push(
        <Pager
          {...pagerProps}
          key={index}
          page={index}
          active={current === index}
        />,
      );
    }
  } else {
    const prevItemTitle = showLessItems ? locale.prev_3 : locale.prev_5;
    const nextItemTitle = showLessItems ? locale.next_3 : locale.next_5;

    const originalJumpPrevElement = (
      <Icon icon="icon-[heroicons-solid--chevron-double-left]" />
    );
    const jumpPrevContent = itemRender ? (
      <PaginationLink className="opacity-0 group-hover:opacity-100" asChild>
        {itemRender(jumpPrevPage, "jump-prev", originalJumpPrevElement)}
      </PaginationLink>
    ) : (
      originalJumpPrevElement
    );

    const originalJumpNextElement = (
      <Icon icon="icon-[heroicons-solid--chevron-double-right]" />
    );
    const jumpNextContent = itemRender ? (
      <PaginationLink className="opacity-0 group-hover:opacity-100" asChild>
        {itemRender(jumpNextPage, "jump-next", originalJumpNextElement)}
      </PaginationLink>
    ) : (
      originalJumpNextElement
    );

    if (showPrevNextJumpers) {
      jumpPrev = (
        <PaginationItem
          title={showTitle ? prevItemTitle : undefined}
          key="prev"
          onClick={() => {
            handleChange(jumpPrevPage);
          }}
          onKeyDown={runIfEnterJumpPrev}
          tabIndex={0}
          role="presentation"
          className="group relative"
        >
          {jumpPrevContent}
          <PaginationEllipsis className="absolute inset-0 group-hover:-z-10 group-hover:opacity-0" />
        </PaginationItem>
      );

      jumpNext = (
        <PaginationItem
          title={showTitle ? nextItemTitle : undefined}
          key="next"
          onClick={jumpNextHandle}
          onKeyDown={runIfEnterJumpNext}
          tabIndex={0}
          role="presentation"
          className="group relative"
        >
          {jumpNextContent}
          <PaginationEllipsis className="absolute inset-0 group-hover:-z-10 group-hover:opacity-0" />
        </PaginationItem>
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

    for (let index = left; index <= right; index += 1) {
      pagerList.push(
        <Pager
          {...pagerProps}
          key={index}
          page={index}
          active={current === index}
        />,
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
      const lastOne = pagerList.at(-1)!;
      pagerList[pagerList.length - 1] = React.cloneElement(lastOne, {
        // className: classNames(
        //   `${prefixCls}-item-before-jump-next`,
        //   lastOne.props.className,
        // ),
      });

      pagerList.push(jumpNext);
    }

    if (left !== 1) {
      pagerList.unshift(<Pager {...pagerProps} key={1} page={1} />);
    }
    if (right !== allPages) {
      pagerList.push(<Pager {...pagerProps} key={allPages} page={allPages} />);
    }
  }

  /*
   * Prev Button
   */
  let prev = renderPrev(prevPage);
  // if (prev) {
  const prevDisabled = !hasPrev || !allPages;
  prev = (
    <PaginationItem
      title={showTitle ? locale.prev_page : undefined}
      onClick={prevHandle}
      tabIndex={prevDisabled ? undefined : 0}
      onKeyDown={runIfEnterPrev}
      className={prevDisabled ? "cursor-not-allowed" : ""}
      aria-disabled={prevDisabled}
    >
      {prev}
    </PaginationItem>
  );
  // }

  /*
   * Next Button
   */
  let next = renderNext(nextPage);
  // if (next) {
  let nextDisabled: boolean, nextTabIndex: number | undefined;
  if (simple) {
    nextDisabled = !hasNext;
    nextTabIndex = hasPrev ? 0 : undefined;
  } else {
    nextDisabled = !hasNext || !allPages;
    nextTabIndex = nextDisabled ? undefined : 0;
  }

  next = (
    <PaginationItem
      title={showTitle ? locale.next_page : undefined}
      onClick={nextHandle}
      tabIndex={nextTabIndex}
      onKeyDown={runIfEnterNext}
      aria-disabled={nextDisabled}
    >
      {next}
    </PaginationItem>
  );
  // }

  const sizeChanger = showSizeChanger ? (
    <PageSizeOptions
      locale={locale}
      pageSize={pageSize}
      pageSizeOptions={pageSizeOptions}
      changeSize={changePageSize}
      sizeChangerRender={sizeChangerRender}
    />
  ) : (
    <></>
  );

  return (
    <PaginationRoot className={cn(className)}>
      <PaginationContent>
        {totalText}
        {prev}
        {pagerList}
        {next}
        {sizeChanger}
      </PaginationContent>
    </PaginationRoot>
  );
};

// const defaultItemRender: PaginationProps["itemRender"] = (
//   _page,
//   _type,
//   element,
// ) => element;

export function generateHref(page: number) {
  const searchParams = new URLSearchParams(globalThis.location.search);
  searchParams.set("page", String(page));
  const newSearch = searchParams.toString();
  const { origin, pathname } = globalThis.location;
  return `${origin}${pathname}?${newSearch}`;
}

function isInteger(v: number) {
  const value = Number(v);
  return (
    typeof value === "number" &&
    !Number.isNaN(value) &&
    Number.isFinite(value) &&
    Math.floor(value) === value
  );
}

function calculatePage(p: number | undefined, pageSize: number, total: number) {
  const _pageSize = p ?? pageSize;
  return Math.floor((total - 1) / _pageSize) + 1;
}
