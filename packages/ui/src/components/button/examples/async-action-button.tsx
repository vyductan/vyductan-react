"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { CircleAlert } from "lucide-react";

import { Button } from "@acme/ui/components/button";
import type { ButtonProps } from "@acme/ui/components/button";
import { Tooltip } from "@acme/ui/components/tooltip";

export type AsyncActionStatus = "idle" | "loading" | "success" | "error";

export type AsyncActionButtonProps = Omit<
  ButtonProps,
  "action" | "aria-invalid" | "icon" | "loading" | "onClick"
> & {
  action: () => Promise<void>;
  errorTooltip?: React.ReactNode;
  idleIcon?: React.ReactNode;
  successIcon?: React.ReactNode;
  errorIcon?: React.ReactNode;
  resetDelay?: number;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

export function AsyncActionButton({
  action,
  errorTooltip,
  idleIcon,
  successIcon,
  errorIcon = <CircleAlert className="text-destructive" />,
  resetDelay = 2000,
  onSuccess,
  onError,
  disabled,
  children,
  ...buttonProps
}: AsyncActionButtonProps): React.JSX.Element {
  const [status, setStatus] = useState<AsyncActionStatus>("idle");

  useEffect(() => {
    if (status === "idle" || status === "loading") {
      return;
    }

    const timeout = globalThis.setTimeout(() => setStatus("idle"), resetDelay);

    return () => globalThis.clearTimeout(timeout);
  }, [resetDelay, status]);

  async function runAction(): Promise<void> {
    if (disabled || status === "loading") {
      return;
    }

    setStatus("loading");

    try {
      await action();
      setStatus("success");
      onSuccess?.();
    } catch (error) {
      setStatus("error");
      onError?.(error);
    }
  }

  const isLoading = status === "loading";
  const isError = status === "error";
  const icon = isError ? errorIcon : status === "success" ? successIcon : idleIcon;

  return (
    <Tooltip
      open={isError && Boolean(errorTooltip)}
      onOpenChange={(open) => {
        if (!open && isError) {
          setStatus("idle");
        }
      }}
      title={errorTooltip}
      placement="top"
    >
      <Button
        {...buttonProps}
        aria-busy={isLoading || undefined}
        aria-invalid={isError || undefined}
        disabled={disabled}
        icon={icon}
        loading={isLoading}
        onClick={runAction}
      >
        {children}
      </Button>
    </Tooltip>
  );
}
