"use client";

import React, { useCallback, useContext, useEffect, useState } from "react";
import VerticalAlignTopOutlined from "@ant-design/icons/VerticalAlignTopOutlined";
import { motion } from "framer-motion";

import type { FloatButtonProps } from "./FloatButton";
import type { FloatButtonRef } from "./types";
import FloatButtonGroupContext from "./context";
import { FloatButton } from "./FloatButton";
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

export const FloatButtonBackToTop = React.forwardRef<
  FloatButtonRef,
  BackToTopProps
>((props, ref) => {
  const {
    shape = "circle",
    visibilityHeight = 400,
    icon = <VerticalAlignTopOutlined />,
    target,
    duration = 450,
    onClick,
    ...restProps
  } = props;

  const [visible, setVisible] = useState<boolean>(visibilityHeight === 0);

  const internalRef = React.useRef<FloatButtonRef["nativeElement"]>(null);

  React.useImperativeHandle(ref, () => ({
    nativeElement: internalRef.current,
  }));

  const getDefaultTarget = (): HTMLElement | Document | Window =>
    internalRef.current?.ownerDocument
      ? internalRef.current.ownerDocument
      : window;

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLElement, UIEvent> | { target: any }) => {
      const scrollTop = getScrollTarget(e.target, true);
      setVisible(scrollTop >= visibilityHeight);
    },
    [visibilityHeight],
  );

  useEffect(() => {
    const getTarget = target ?? getDefaultTarget;
    const container = getTarget();
    handleScroll({ target: container });
    container.addEventListener("scroll", handleScroll);
    return () => {
      // handleScroll.cancel();
      container.removeEventListener("scroll", handleScroll);
    };
  }, [target, handleScroll]);

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
      <FloatButton ref={internalRef} {...contentProps} onClick={scrollToTop} />
    </motion.div>
  );
});

if (process.env.NODE_ENV !== "production") {
  FloatButtonBackToTop.displayName = "BackTop";
}
