"use client";

import type { CSSProperties, ReactElement, ReactNode, Ref } from "react";
import { cloneElement, useImperativeHandle, useRef } from "react";
import { useHover } from "ahooks";

import { cn } from "@acme/ui/lib/utils";

import type { BaseInputProps } from "../types";
import { Icon } from "../../../icons";
import { GenericSlot } from "../../slot";
import { hasAddon, hasPrefixSuffix } from "../utils/common-utils";

export interface HolderRef {
  /** Provider holder ref. Will return `null` if not wrap anything */
  nativeElement: HTMLElement | null;
}

/** To wrap input by div or not */
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
  const isHovering = useHover(containerRef);
  if (hasAffix) {
    // ================== Clear Icon ================== //
    let clearIcon: ReactNode = null;
    if (allowClear) {
      const needClear = !disabled && !readOnly && value;
      const iconNode =
        typeof allowClear === "object" && allowClear.clearIcon ? (
          allowClear.clearIcon
        ) : (
          <Icon
            icon="icon-[ant-design--close-circle-filled]"
            className="pointer-events-none size-4"
          />
        );

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
          className={cn("size-4 opacity-30 hover:opacity-50", {
            [`hidden`]: !needClear,
            // [`mx-1`]: !!suffix,
          })}
        >
          {iconNode}
        </button>
      );
    }

    const suffixNode = (!!suffix || allowClear) && (
      <span
        className={cn("ml-1 flex items-center", classNames?.suffix)}
        style={styles?.suffix}
      >
        {allowClear && value && (!suffix || (isHovering && suffix)) ? (
          clearIcon
        ) : typeof suffix === "string" ? (
          <span>{suffix}</span>
        ) : (
          suffix
        )}
      </span>
    );

    element = (
      <AffixWrapperComponent
        data-slot="affix-wrapper"
        className={cn(
          "text-sm",
          "relative inline-flex w-full transition-all",
          "[&_input]:h-auto [&_input]:border-none [&_input]:p-0 [&_input]:outline-none",
          cn(classNames?.affixWrapper, classNames?.variant),
          // fix cannot merge className by GenericSlot
          className,
        )}
        style={styles?.affixWrapper}
        onClick={onInputClick}
        {...dataAttrs?.affixWrapper}
        ref={containerRef}
      >
        {prefix && (
          <span
            className={cn("mr-1 flex items-center", classNames?.prefix)}
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
      <GroupWrapperComponent
        data-slot="input-group-wrapper"
        className={mergedGroupClassName}
        ref={groupRef}
      >
        <WrapperComponent
          data-slot="input-wrapper"
          className={mergedWrapperClassName}
        >
          {addonBefore && (
            <GroupAddonComponent
              data-slot="input-group-addon"
              className={addonCls}
            >
              {addonBefore}
            </GroupAddonComponent>
          )}
          {element}
          {addonAfter && (
            <GroupAddonComponent
              data-slot="input-group-addon"
              className={addonCls}
            >
              {addonAfter}
            </GroupAddonComponent>
          )}
        </WrapperComponent>
      </GroupWrapperComponent>
    );
  }

  return (
    <GenericSlot
      className={cn(
        (element as ReactElement<{ className?: string } | undefined>).props
          ?.className,
        className,
      )}
      style={{
        ...(element as ReactElement<{ style?: CSSProperties } | undefined>)
          .props?.style,
        ...style,
      }}
      hidden={hidden}
    >
      {element}
    </GenericSlot>
  );
};

export { BaseInput };
