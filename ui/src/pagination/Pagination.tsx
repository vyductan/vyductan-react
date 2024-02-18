import React from "react";
import { useMergedState } from "rc-util";
import KeyCode from "rc-util/lib/KeyCode";

import { Icon } from "@vyductan/icons";

import type { PaginationItemProps } from "./components";
import type { PaginationLocale } from "./types";
import {
  PaginationContent,
  // PaginationEllipsis,
  PaginationItem,
  // PaginationLink,
  // PaginationNext,
  // PaginationPrevious,
  PaginationRoot,
  PaginationTotal,
} from "./components";
import enUS from "./locale/en_US";

export type PaginationProps = {
  current: number;
  defaultCurrent?: number;
  pageSize: number;
  defaultPageSize?: number;
  total: number;
  // pageSizeOptions?: string[]
  onChange?: (page: number, pageSize: number) => void;

  disabled?: boolean;
  hideOnSinglePage?: boolean;
  locale?: PaginationLocale;
  simple?: boolean;
  showLessItems?: boolean;
  showPrevNextJumpers?: boolean;
  showQuickJumper?:
    | boolean
    | {
        goButton: React.ReactNode;
      };
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
    current: currentProp,
    defaultCurrent = 1,
    pageSize: pageSizeProp,
    defaultPageSize = 10,
    total,
    onChange,

    disabled,
    hideOnSinglePage,
    locale = enUS,
    simple,
    showLessItems,
    showPrevNextJumpers = true,
    showQuickJumper,
    // showSizeChanger: showSizeChangerProp,
    showTitle,
    showTotal,
    // totalBoundaryShowSizeChanger = 50,

    itemRender = defaultItemRender,
  } = props;

  const [pageSize, _setPageSize] = useMergedState<number>(10, {
    value: pageSizeProp,
    defaultValue: defaultPageSize,
  });

  const [current, setCurrent] = useMergedState<number>(1, {
    value: currentProp,
    defaultValue: defaultCurrent,
    postState: (c) =>
      Math.max(1, Math.min(c, calculatePage(undefined, pageSize, total))),
  });

  const [internalInputVal, setInternalInputVal] = React.useState(current);

  React.useEffect(() => {
    setInternalInputVal(current);
  }, [current]);

  const hasOnChange = onChange !== noop;
  const hasCurrent = "current" in props;

  if (
    process.env.NODE_ENV !== "production" && hasCurrent ? !hasOnChange : false
  ) {
    console.warn(
      "You provided a `current` prop to a Pagination component without an `onChange` handler. This will render a read-only component.",
    );
  }

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

      setCurrent(newPage);
      onChange?.(newPage, pageSize);

      return newPage;
    }

    return current;
  }

  const hasPrev = current > 1;
  const hasNext = current < calculatePage(undefined, pageSize, total);
  // const showSizeChanger =
  //   showSizeChangerProp ?? total > totalBoundaryShowSizeChanger;

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback: (...params: any[]) => void,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...restParams: any[]
  ) {
    if (
      event.key === "Enter" ||
      event.code === KeyCode.ENTER.toString()
      // event..keyCode === KeyCode.ENTER
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
    const prevButton = itemRender?.(
      prevPage,
      "prev",
      <Icon
        icon="mingcute:left-fill"
        className="size-4"
        aria-label="Go to previous page"
      />,
      // getItemIcon(prevIcon, 'prev page'),
    );
    return React.isValidElement<HTMLButtonElement>(prevButton)
      ? React.cloneElement(prevButton, { disabled: !hasPrev })
      : prevButton;
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

  const goButton =
    typeof showQuickJumper === "boolean"
      ? showQuickJumper
      : showQuickJumper?.goButton;

  // ================== Simple ==================
  let _gotoButton = goButton;
  let simplePager: React.ReactNode = null;

  function getValidValue(
    e:
      | React.KeyboardEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLInputElement>,
  ): number {
    const inputValue = e.currentTarget.value;
    const allPages = calculatePage(undefined, pageSize, total);
    let value: number;
    if (inputValue === "") {
      value = defaultCurrent;
    } else if (Number.isNaN(Number(inputValue))) {
      value = internalInputVal;
    } else if (Number(inputValue) >= allPages) {
      value = allPages;
    } else {
      value = Number(inputValue);
    }
    return value;
  }
  /**
   * prevent "up arrow" key reseting cursor position within textbox
   * @see https://stackoverflow.com/a/1081114
   */
  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.keyCode === KeyCode.UP || event.keyCode === KeyCode.DOWN) {
      event.preventDefault();
    }
  }

  function handleKeyUp(
    event:
      | React.KeyboardEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLInputElement>,
  ) {
    const value = getValidValue(event);
    if (value !== internalInputVal) {
      setInternalInputVal(value);
    }

    switch ((event as React.KeyboardEvent<HTMLInputElement>).keyCode) {
      case KeyCode.ENTER:
        handleChange(value);
        break;
      case KeyCode.UP:
        handleChange(value - 1);
        break;
      case KeyCode.DOWN:
        handleChange(value + 1);
        break;
      default:
        break;
    }
  }

  function handleBlur(event: React.FocusEvent<HTMLInputElement, Element>) {
    handleChange(getValidValue(event));
  }

  if (simple) {
    // ====== Simple quick jump ======
    if (goButton) {
      if (typeof goButton === "boolean") {
        _gotoButton = (
          <button
            type="button"
            onClick={() => {
              handleChange(internalInputVal);
            }}
            onKeyUp={(e) => {
              if (e.code === KeyCode.ENTER.toString()) {
                handleChange(internalInputVal);
              }
            }}
          >
            Go to
          </button>
        );
      } else {
        _gotoButton = (
          <span
            onClick={() => {
              handleChange(internalInputVal);
            }}
            onKeyUp={(e) => {
              if (e.code === KeyCode.ENTER.toString()) {
                handleChange(internalInputVal);
              }
            }}
            role="button"
            tabIndex={0}
          >
            {goButton}
          </span>
        );
      }

      _gotoButton = (
        <li title={showTitle ? `Jump to ${current}/${allPages}` : undefined}>
          {_gotoButton}
        </li>
      );
    }

    simplePager = (
      <li title={showTitle ? `${current}/${allPages}` : undefined}>
        <input
          type="text"
          value={internalInputVal}
          disabled={disabled}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onChange={handleKeyUp}
          onBlur={handleBlur}
          size={3}
        />
        <span>/</span>
        {allPages}
      </li>
    );
  }

  // ====================== Normal ======================
  const pagerList: React.ReactElement<PaginationItemProps>[] = [];

  const pagerProps: Omit<PaginationItemProps, "ref"> = {
    onClick: (page) => {
      if (page) {
        handleChange(page);
      }
    },
    onKeyUp: runIfEnter,
    // showTitle,
    // itemRender,
    page: -1,
  };

  const prevPage = current - 1 > 0 ? current - 1 : 0;
  const nextPage = current + 1 < allPages ? current + 1 : allPages;
  const pageBufferSize = showLessItems ? 1 : 2;
  if (allPages <= 3 + pageBufferSize * 2) {
    if (!allPages) {
      pagerList.push(
        <PaginationItem
          {...pagerProps}
          ref={null}
          key="noPager"
          page={1}
          // className={`${prefixCls}-item-disabled`}
        />,
      );
    }

    for (let i = 1; i <= allPages; i += 1) {
      pagerList.push(
        <PaginationItem
          {...pagerProps}
          ref={null}
          key={i}
          page={i}
          active={current === i}
        />,
      );
    }
  } else {
    const prevItemTitle = showLessItems ? locale.prev_3 : locale.prev_5;
    const nextItemTitle = showLessItems ? locale.next_3 : locale.next_5;

    const jumpPrevContent = itemRender?.(
      jumpPrevPage,
      "jump-prev",
      <Icon icon="icon-park-outline:double-left" aria-label="prev page" />,
    );
    const jumpNextContent = itemRender?.(
      jumpNextPage,
      "jump-next",
      <Icon icon="icon-park-outline:double-right" aria-label="next page" />,
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
        <PaginationItem
          {...pagerProps}
          ref={null}
          key={i}
          page={i}
          active={current === i}
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
      pagerList.unshift(<PaginationItem {...pagerProps} key={1} page={1} />);
    }
    if (right !== allPages) {
      pagerList.push(
        <PaginationItem {...pagerProps} key={allPages} page={allPages} />,
      );
    }
  }

  let prev = renderPrev(prevPage);
  if (prev) {
    const prevDisabled = !hasPrev || !allPages;
    prev = (
      <PaginationItem
        title={showTitle ? locale.prev_page : undefined}
        onClick={prevHandle}
        tabIndex={prevDisabled ? undefined : 0}
        onKeyDown={runIfEnterPrev}
        // className={classNames(`${prefixCls}-prev`, {
        //   [`${prefixCls}-disabled`]: prevDisabled,
        // })}
        aria-disabled={prevDisabled}
        shape="icon"
      >
        {prev}
      </PaginationItem>
    );
  }

  /*
   * Next Button
   */
  function renderNext(nextPage: number) {
    const nextButton = itemRender?.(
      nextPage,
      "next",
      <Icon
        icon="mingcute:right-fill"
        className="size-4"
        aria-label="Go to next page"
      />,
    );
    return React.isValidElement<HTMLButtonElement>(nextButton)
      ? React.cloneElement(nextButton, { disabled: !hasNext })
      : nextButton;
  }
  let next = renderNext(nextPage);
  if (next) {
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
        page={current - 1}
        onClick={nextHandle}
        tabIndex={nextTabIndex}
        onKeyDown={runIfEnterNext}
        disabled={nextDisabled}
        aria-disabled={nextDisabled}
        shape="icon"
      >
        {next}
      </PaginationItem>
    );
  }

  return (
    <PaginationRoot>
      <PaginationContent>
        {totalText}
        {prev}
        {simple ? simplePager : pagerList}
        {next}
        {/* <PaginationItem onClick={prevHandle}> */}
        {/*   <PaginationPrevious href="#" /> */}
        {/* </PaginationItem> */}
        {/* <PaginationItem> */}
        {/*   <PaginationLink href="#">1</PaginationLink> */}
        {/* </PaginationItem> */}
        {/* <PaginationItem> */}
        {/*   <PaginationLink href="#" isActive> */}
        {/*     2 */}
        {/*   </PaginationLink> */}
        {/* </PaginationItem> */}
        {/* <PaginationItem> */}
        {/*   <PaginationLink href="#">3</PaginationLink> */}
        {/* </PaginationItem> */}
        {/* <PaginationItem> */}
        {/*   <PaginationEllipsis /> */}
        {/* </PaginationItem> */}
        {/* <PaginationItem onClick={nextHandle}> */}
        {/*   <PaginationNext href="#" /> */}
        {/* </PaginationItem> */}
      </PaginationContent>
    </PaginationRoot>
  );
};

function noop() {
  //
}

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
