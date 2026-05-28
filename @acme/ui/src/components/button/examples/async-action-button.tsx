"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { CircleAlert } from "lucide-react";

import type { ButtonProps } from "@acme/ui/components/button";
import { Button, LoadingIcon } from "@acme/ui/components/button";
import { Tooltip } from "@acme/ui/components/tooltip";
import { cn } from "@acme/ui/lib/utils";

export type AsyncActionStatus = "idle" | "loading" | "success" | "error";

const DEFAULT_ERROR_RESET_DELAY = 4500;

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
  errorResetDelay?: number | boolean;
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
  errorResetDelay = false,
  onSuccess,
  onError,
  disabled,
  className,
  children,
  ...buttonProps
}: AsyncActionButtonProps): React.JSX.Element {
  const [status, setStatus] = useState<AsyncActionStatus>("idle");

  useEffect(() => {
    if (status === "idle" || status === "loading") {
      return;
    }

    const statusResetDelay =
      status === "error"
        ? errorResetDelay === false
          ? undefined
          : errorResetDelay === true
            ? DEFAULT_ERROR_RESET_DELAY
            : errorResetDelay
        : resetDelay;

    if (statusResetDelay === undefined) {
      return;
    }

    const timeout = globalThis.setTimeout(
      () => setStatus("idle"),
      statusResetDelay,
    );

    return () => globalThis.clearTimeout(timeout);
  }, [errorResetDelay, resetDelay, status]);

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
  const icon = isLoading ? (
    <LoadingIcon />
  ) : isError ? (
    errorIcon
  ) : status === "success" ? (
    successIcon
  ) : (
    idleIcon
  );
  const animatedIcon = icon ? (
    <span
      key={status}
      aria-hidden="true"
      className="animate-in fade-in-0 zoom-in-90 inline-flex items-center justify-center transition-all duration-200 ease-out motion-reduce:animate-none motion-reduce:transition-none"
      data-slot="async-action-icon"
    >
      {icon}
    </span>
  ) : undefined;

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
        className={cn(
          isLoading && "cursor-not-allowed opacity-95 shadow-sm saturate-100",
          className,
        )}
        data-async-status={status}
        disabled={disabled || isLoading}
        icon={animatedIcon}
        onClick={runAction}
      >
        {children}
      </Button>
    </Tooltip>
  );
}
