"use client";

import React, { memo, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import useMergedState from "rc-util/lib/hooks/useMergedState";

import type { FloatButtonProps } from "./FloatButton";
import type { FloatButtonRef } from "./types";
import { CloseOutlined } from "../icons";
import { FloatButtonGroupProvider } from "./context";
import { FloatButton } from "./FloatButton";

type FloatButtonGroupProps = FloatButtonProps & {
  children: React.ReactNode;
  trigger?: "click" | "hover";
  open?: boolean;
  closeIcon?: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
};
const FloatButtonGroup: React.FC<FloatButtonGroupProps> = (props) => {
  const {
    style,
    shape = "circle",
    icon,
    closeIcon = <CloseOutlined />,
    trigger,
    children,
    onOpenChange,
    open: customOpen,
    ...floatButtonProps
  } = props;
  const [open, setOpen] = useMergedState(false, { value: customOpen });

  const floatButtonGroupRef = React.useRef<HTMLDivElement>(null);

  const floatButtonRef = React.useRef<FloatButtonRef["nativeElement"]>(null);

  const hoverAction = React.useMemo<React.DOMAttributes<HTMLDivElement>>(() => {
    const hoverTypeAction = {
      onMouseEnter() {
        setOpen(true);
        onOpenChange?.(true);
      },
      onMouseLeave() {
        setOpen(false);
        onOpenChange?.(false);
      },
    };
    return trigger === "hover" ? hoverTypeAction : {};
  }, [trigger, onOpenChange, setOpen]);

  const handleOpenChange = useCallback(() => {
    setOpen((prevState) => {
      onOpenChange?.(!prevState);
      return !prevState;
    });
  }, [onOpenChange, setOpen]);

  const onClick = useCallback(
    (e: MouseEvent) => {
      if (floatButtonGroupRef.current?.contains(e.target as Node)) {
        if (floatButtonRef.current?.contains(e.target as Node)) {
          handleOpenChange();
        }
        return;
      }
      setOpen(false);
      onOpenChange?.(false);
    },
    [handleOpenChange, onOpenChange, setOpen],
  );

  useEffect(() => {
    if (trigger === "click") {
      document.addEventListener("click", onClick);
      return () => {
        document.removeEventListener("click", onClick);
      };
    }
  }, [trigger, onClick]);

  // =================== Warning =====================
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      !("open" in props) || !!trigger,
      "usage",
      "`open` need to be used together with `trigger`",
    );
  }
  const variants = {
    open: {
      transition: { staggerChildren: 0.07, delayChildren: 0.2 },
    },
    closed: {
      transition: { staggerChildren: 0.05, staggerDirection: -1 },
    },
  };

  return (
    <FloatButtonGroupProvider value={shape}>
      <div
        ref={floatButtonGroupRef}
        className={""}
        style={style}
        {...hoverAction}
      >
        {trigger && ["click", "hover"].includes(trigger) ? (
          <>
            <motion.div initial={false} animate={open ? "open" : "closed"}>
              <motion.div variants={variants}>{children}</motion.div>
            </motion.div>
            <FloatButton
              ref={floatButtonRef}
              shape={shape}
              icon={open ? closeIcon : icon}
              aria-label={props["aria-label"]}
              {...floatButtonProps}
            />
          </>
        ) : (
          children
        )}
      </div>
    </FloatButtonGroupProvider>
  );
};

export default memo(FloatButtonGroup);
