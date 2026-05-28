"use client";

import React, { useCallback, useContext, useSyncExternalStore } from "react";
import { motion } from "motion/react";

import type { FloatButtonProps } from "./float-button";
import type { FloatButtonRef } from "./types";
import { Icon } from "../../icons";
import FloatButtonGroupContext from "./context";
import { FloatButton } from "./float-button";
import { getScrollTarget, scrollTo } from "./utils";

export type BackToTopProps = Omit<FloatButtonProps, "target"> & {
  visibilityHeight?: number;
  // onClick?: React.MouseEventHandler<FloatButtonElement>;
  target?: () => HTMLElement | Window | Document;
  prefixCls?: string;
  children?: React.ReactNode;
  className?: string;
  rootClassName?: string;
  style?: React.CSSProperties;
  duration?: number;
};

export const FloatButtonBackToTop = ({
  shape = "circle",
  visibilityHeight = 400,
  icon = <Icon icon="icon-[ant-design--vertical-align-top-outlined]" />,
  target,
  duration = 450,
  onClick,
  ref,
  ...restProps
}: BackToTopProps & { ref?: React.Ref<FloatButtonRef> }) => {
  const internalRef = React.useRef<FloatButtonRef["nativeElement"]>(null);

  React.useImperativeHandle(ref, () => ({
    nativeElement: internalRef.current,
  }));

  const getDefaultTarget = useCallback(
    (): HTMLElement | Document | Window =>
      // eslint-disable-next-line unicorn/prefer-global-this
      internalRef.current?.ownerDocument ?? window,
    [],
  );

  const getTarget = target ?? getDefaultTarget;

  const subscribeToScroll = useCallback(
    (onStoreChange: () => void) => {
      const container = getTarget();
      container.addEventListener("scroll", onStoreChange);

      return () => {
        container.removeEventListener("scroll", onStoreChange);
      };
    },
    [getTarget],
  );

  const getVisibleSnapshot = useCallback(() => {
    const scrollTop = getScrollTarget(getTarget(), true);
    return scrollTop >= visibilityHeight;
  }, [getTarget, visibilityHeight]);

  const getServerVisibleSnapshot = useCallback(
    () => visibilityHeight === 0,
    [visibilityHeight],
  );

  const visible = useSyncExternalStore(
    subscribeToScroll,
    getVisibleSnapshot,
    getServerVisibleSnapshot,
  );

  const scrollToTop: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    // TODO: switch to use react-scroll
    scrollTo(0, { getContainer: target ?? getDefaultTarget, duration });
    onClick?.(e);
  };

  const groupShape = useContext(FloatButtonGroupContext);

  const mergeShape = groupShape ?? shape;

  const contentProps: FloatButtonProps = {
    icon,
    shape: mergeShape,
    ...restProps,
  };

  const variants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
  };

  return (
    <motion.div animate={visible ? "visible" : "hidden"} variants={variants}>
      <FloatButton {...contentProps} onClick={scrollToTop} ref={internalRef} />
    </motion.div>
  );
};

if (process.env.NODE_ENV !== "production") {
  FloatButtonBackToTop.displayName = "BackTop";
}
