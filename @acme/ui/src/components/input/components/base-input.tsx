/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { CSSProperties, ReactElement, ReactNode, Ref } from "react";
import { cloneElement, useImperativeHandle, useRef } from "react";
import { useHover } from "ahooks";

import { cn } from "@acme/ui/lib/utils";

import type { BaseInputProps as BaseInputProperties } from "../types";
import { InputGroup, InputGroupAddon } from "../../input-group";
import { GenericSlot } from "../../slot";
import { hasAddon, hasPrefixSuffix } from "../utils/common-utils";
import { ClearIcon } from "./clear-icon";

export interface HolderRef {
  /** Provider holder ref. Will return `null` if not wrap anything */
  nativeElement: HTMLElement | null;
}

/** To wrap input by div or not */
const BaseInput = (
  properties: BaseInputProperties & { ref: Ref<HolderRef> },
) => {
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
  } = properties;

  const inputElement = children;

  const AffixWrapperComponent = components?.affixWrapper;
  const GroupWrapperComponent = components?.groupWrapper ?? "span";
  const WrapperComponent = components?.wrapper ?? "span";
  const GroupAddonComponent = components?.groupAddon ?? "span";

  const containerReference = useRef<HTMLDivElement>(null);

  const onInputClick: React.MouseEventHandler = (e) => {
    if (containerReference.current?.contains(e.target as Element)) {
      triggerFocus?.();
    }
  };

  const hasAffix = hasPrefixSuffix(properties);
  const isAddon = hasAddon(properties);

  let element: ReactElement = cloneElement(inputElement as ReactElement<any>, {
    value,
    className:
      cn(
        (inputElement as ReactElement<{ className?: string } | undefined>).props
          ?.className,
        !hasAffix && !isAddon && [className, classNames?.variant],
      ) || undefined,
  });

  // ======================== Ref ======================== //
  const groupReference = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    nativeElement: groupReference.current ?? containerReference.current,
  }));

  // ================== Prefix & Suffix ================== //
  const isHovering = useHover(containerReference);
  if (hasAffix) {
    // ================== Clear Icon ================== //
    let clearIcon: ReactNode;
    if (allowClear) {
      const needClear = !disabled && !readOnly && !!value;

      clearIcon = (
        <ClearIcon
          visible={needClear}
          onClick={(event) => {
            handleReset?.(event);
            onClear?.();
          }}
        />
      );
    }

    const suffixNode =
      allowClear && value && (!suffix || (isHovering && suffix)) ? (
        clearIcon
      ) : typeof suffix === "string" ? (
        <span>{suffix}</span>
      ) : (
        suffix
      );

    element = AffixWrapperComponent ? (
      <AffixWrapperComponent
        data-slot="affix-wrapper"
        className={cn(
          "relative inline-flex w-full text-sm [&_input]:h-auto [&_input]:border-none [&_input]:outline-none",
          isAddon
            ? "border-none bg-transparent p-0 shadow-none outline-none"
            : "transition-all",
          classNames?.affixWrapper,
          !isAddon && classNames?.variant,
          !isAddon && className,
        )}
        style={styles?.affixWrapper}
        onClick={onInputClick}
        {...dataAttrs?.affixWrapper}
        ref={containerReference}
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
        {(!!suffix || allowClear) && (
          <span
            className={cn("order-2 ml-1 flex items-center", classNames?.suffix)}
            style={styles?.suffix}
          >
            {suffixNode}
          </span>
        )}
      </AffixWrapperComponent>
    ) : (
      <InputGroup
        data-slot="input-group"
        className={cn(
          isAddon
            ? "border-none bg-transparent p-0 shadow-none outline-none"
            : "transition-all",
          classNames?.affixWrapper,
          !isAddon && classNames?.variant,
          !isAddon && className,
        )}
        style={styles?.affixWrapper}
        data-disabled={disabled ? "true" : undefined}
        {...dataAttrs?.affixWrapper}
        ref={containerReference}
      >
        {prefix && (
          <InputGroupAddon
            align="inline-start"
            className={classNames?.prefix}
            style={styles?.prefix}
          >
            {prefix}
          </InputGroupAddon>
        )}
        {element}
        {(!!suffix || allowClear) && (
          <InputGroupAddon
            align="inline-end"
            className={classNames?.suffix}
            style={styles?.suffix}
          >
            {suffixNode}
          </InputGroupAddon>
        )}
      </InputGroup>
    );
  }

  // ================== Addon ================== //
  if (hasAddon(properties)) {
    // const wrapperCls = `${prefixCls}-group`;
    const addonCls = cn(
      "flex items-center",
      "bg-muted px-3",
      // "border border-input py-0",
      "text-muted-foreground text-sm",
    );

    const mergedWrapperClassName = cn(
      //   `${prefixCls}-wrapper`,
      classNames?.wrapper,
    );

    // Clone element, override border/styling and remove border radius when has addons
    const clonedElement = cloneElement(element as ReactElement<any>, {
      className: cn(
        (element as ReactElement<{ className?: string } | undefined>).props
          ?.className,
        // Override variant border/background/shadow when has addon
        "border-none! shadow-none! ring-0! bg-transparent!",
        // Remove outline on focus-visible
        "focus-visible:outline-0!",
        // Remove padding from sides that touch addon
        addonBefore && "rounded-l-none!",
        addonAfter && "rounded-r-none!",
        // Keep padding on the other sides
        // !addonBefore && "pl-[11px]",
        // !addonAfter && "pr-[11px]",
      ),
    });

    // Need another wrapper for changing display:table to display:inline-block
    // and put style prop in wrapper
    element = (
      <GroupWrapperComponent
        data-slot="input-group-wrapper"
        className={classNames?.groupWrapper}
        ref={groupReference}
      >
        <WrapperComponent
          data-slot="input-wrapper"
          className={cn(
            mergedWrapperClassName,
            "flex items-stretch",
            classNames?.variant,
            "p-0",
            className,
          )}
        >
          {addonBefore && (
            <GroupAddonComponent
              data-slot="input-group-addon"
              className={cn(addonCls, "rounded-l-md border-r-0")}
            >
              {addonBefore}
            </GroupAddonComponent>
          )}
          {clonedElement}
          {addonAfter && (
            <GroupAddonComponent
              data-slot="input-group-addon"
              className={cn(addonCls, "rounded-r-md border-l-0")}
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
