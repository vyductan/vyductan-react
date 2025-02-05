/* eslint-disable unicorn/no-null */
import type { CSSProperties, ReactElement, ReactNode, Ref } from "react";
import { cloneElement, useImperativeHandle, useRef } from "react";

import type { BaseInputProps } from "../types";
import { cn } from "../..";
import { hasAddon, hasPrefixSuffix } from "../utils/common-utils";

export interface HolderRef {
  /** Provider holder ref. Will return `null` if not wrap anything */
  nativeElement: HTMLElement | null;
}

const BaseInput = (props: BaseInputProps & { ref: Ref<HolderRef> }) => {
  const {
    ref,
    children,
    prefix,
    suffix,
    addonBefore,
    addonAfter,
    className,
    style,
    disabled,
    readOnly,
    // focused,
    triggerFocus,
    allowClear,
    value,
    handleReset,
    hidden,
    classNames,
    dataAttrs,
    styles,
    components,
    onClear,
  } = props;

  const inputElement = children;

  const AffixWrapperComponent = components?.affixWrapper ?? "span";
  const GroupWrapperComponent = components?.groupWrapper ?? "span";
  const WrapperComponent = components?.wrapper ?? "span";
  const GroupAddonComponent = components?.groupAddon ?? "span";

  const containerRef = useRef<HTMLDivElement>(null);

  const onInputClick: React.MouseEventHandler = (e) => {
    if (containerRef.current?.contains(e.target as Element)) {
      triggerFocus?.();
    }
  };

  const hasAffix = hasPrefixSuffix(props);

  let element: ReactElement = cloneElement(inputElement as ReactElement<any>, {
    value,
    className:
      cn(
        (inputElement as ReactElement<{ className?: string } | undefined>).props
          ?.className,
        !hasAffix && classNames?.variant,
      ) || null,
  });

  // ======================== Ref ======================== //
  const groupRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    nativeElement: groupRef.current ?? containerRef.current,
  }));

  // ================== Prefix & Suffix ================== //
  if (hasAffix) {
    // ================== Clear Icon ================== //
    let clearIcon: ReactNode = null;
    if (allowClear) {
      const needClear = !disabled && !readOnly && value;
      const iconNode =
        typeof allowClear === "object" && allowClear.clearIcon
          ? allowClear.clearIcon
          : "✖";

      clearIcon = (
        <button
          type="button"
          onClick={(event) => {
            handleReset?.(event);
            onClear?.();
          }}
          // Do not trigger onBlur when clear input
          // https://github.com/ant-design/ant-design/issues/31200
          onMouseDown={(e) => e.preventDefault()}
          className={cn("ml-1 flex opacity-30 hover:opacity-50", {
            [`hidden`]: !needClear,
            [`has-suffix`]: !!suffix,
          })}
        >
          {iconNode}
        </button>
      );
    }

    const suffixNode = (suffix ?? allowClear) && (
      <span
        className={cn(
          // `${prefixCls}-suffix`,
          "ml-1 flex items-center",
          classNames?.suffix,
        )}
        style={styles?.suffix}
      >
        {clearIcon}
        {suffix}
      </span>
    );

    element = (
      <AffixWrapperComponent
        className={cn(classNames?.affixWrapper, classNames?.variant)}
        style={styles?.affixWrapper}
        onClick={onInputClick}
        {...dataAttrs?.affixWrapper}
        ref={containerRef}
      >
        {prefix && (
          <span
            className={cn(
              // `${prefixCls}-prefix`,
              classNames?.prefix,
            )}
            style={styles?.prefix}
          >
            {prefix}
          </span>
        )}
        {element}
        {suffixNode}
      </AffixWrapperComponent>
    );
  }

  // ================== Addon ================== //
  if (hasAddon(props)) {
    // const wrapperCls = `${prefixCls}-group`;
    const wrapperCls = ``;
    const addonCls = `${wrapperCls}-addon`;
    const groupWrapperCls = `${wrapperCls}-wrapper`;

    const mergedWrapperClassName = cn(
      //   `${prefixCls}-wrapper`,
      wrapperCls,
      classNames?.wrapper,
    );

    const mergedGroupClassName = cn(
      groupWrapperCls,
      {
        [`${groupWrapperCls}-disabled`]: disabled,
      },
      classNames?.groupWrapper,
    );

    // Need another wrapper for changing display:table to display:inline-block
    // and put style prop in wrapper
    element = (
      <GroupWrapperComponent className={mergedGroupClassName} ref={groupRef}>
        <WrapperComponent className={mergedWrapperClassName}>
          {addonBefore && (
            <GroupAddonComponent className={addonCls}>
              {addonBefore}
            </GroupAddonComponent>
          )}
          {element}
          {addonAfter && (
            <GroupAddonComponent className={addonCls}>
              {addonAfter}
            </GroupAddonComponent>
          )}
        </WrapperComponent>
      </GroupWrapperComponent>
    );
  }

  // `className` and `style` are always on the root element
  return cloneElement(element as ReactElement<any>, {
    className:
      cn(
        (element as ReactElement<{ className?: string } | undefined>).props
          ?.className,
        className,
      ) || null,
    style: {
      ...(element as ReactElement<{ style?: CSSProperties } | undefined>).props
        ?.style,
      ...style,
    },
    hidden,
  });
};

export { BaseInput };
