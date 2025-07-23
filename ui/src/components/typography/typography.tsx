import * as React from "react";

import { cn } from "../../lib/utils";

type BaseTypographyProps = React.HTMLAttributes<HTMLElement> & {
  className?: string;
  children?: React.ReactNode;
  /**
   * When `asChild` is true, the component will render its child and pass all props to it.
   * This is useful when you want to use the Typography styles on a custom component.
   * @default false
   */
  asChild?: boolean;
  code?: boolean;
  copyable?: boolean | { text?: string; onCopy?: () => void };
  delete?: boolean;
  disabled?: boolean;
  editable?:
    | boolean
    | {
        editing?: boolean;
        onStart?: () => void;
        onChange?: (value: string) => void;
      };
  ellipsis?:
    | boolean
    | {
        rows?: number;
        expandable?: boolean;
        onExpand?: (e: React.MouseEvent<HTMLElement>) => void;
      };
  mark?: boolean;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  strong?: boolean;
  italic?: boolean;
  type?: "secondary" | "success" | "warning" | "danger";
  underline?: boolean;
};

const Typography = ({
  asChild = false,
  className,
  children,
  code = false,
  // copyable,
  delete: del = false,
  disabled = false,
  // editable,
  // ellipsis = false,
  mark = false,
  onClick,
  strong = false,
  italic = false,
  type,
  underline = false,
  ...props
}: BaseTypographyProps) => {
  const Tag = del ? "del" : "span";

  const getTypeClass = () => {
    if (!type) return "";
    switch (type) {
      case "secondary": {
        return "text-muted-foreground";
      }
      case "success": {
        return "text-green-600 dark:text-green-400";
      }
      case "warning": {
        return "text-amber-600 dark:text-amber-400";
      }
      case "danger": {
        return "text-red-600 dark:text-red-400";
      }
      default: {
        return "";
      }
    }
  };

  const classes = cn(
    "leading-relaxed",
    code && "bg-muted relative rounded px-[0.3em] py-[0.2em] font-mono text-sm",
    disabled && "cursor-not-allowed opacity-50",
    mark && "bg-yellow-100 dark:bg-yellow-900/50",
    strong && "font-semibold",
    italic && "italic",
    underline && "underline",
    getTypeClass(),
    className,
  );

  if (asChild) {
    const child = React.Children.only(children) as React.ReactElement<
      React.HTMLAttributes<HTMLElement>
    >;
    return React.cloneElement(child, {
      className: cn(classes, child.props.className),
      ...props,
    });
  }

  return (
    <Tag className={classes} onClick={onClick} {...props}>
      {children}
    </Tag>
  );
};

type TitleProps = BaseTypographyProps & {
  level?: 1 | 2 | 3 | 4 | 5;
};

const Title = ({ level = 1, className, children, ...props }: TitleProps) => {
  const Component = `h${level}` as keyof React.JSX.IntrinsicElements;

  const sizeClasses = {
    1: "text-4xl font-bold tracking-tight",
    2: "text-3xl font-semibold tracking-tight",
    3: "text-2xl font-semibold tracking-tight",
    4: "text-xl font-semibold tracking-tight",
    5: "text-lg font-medium",
  }[level];

  return (
    <Typography
      asChild
      className={cn(sizeClasses, "mt-0 mb-4", className)}
      {...props}
    >
      <Component>{children}</Component>
    </Typography>
  );
};

type TextProps = BaseTypographyProps & {
  keyboard?: boolean;
};

const Text = ({ className, keyboard = false, ...props }: TextProps) => {
  return (
    <Typography
      className={cn(
        keyboard &&
          "rounded border border-b-2 border-neutral-200 bg-neutral-100 px-1.5 py-0.5 font-mono text-xs dark:border-neutral-700 dark:bg-neutral-800",
        className,
      )}
      {...props}
    />
  );
};

type ParagraphProps = BaseTypographyProps & {
  spacing?: "default" | "tight" | "loose";
};

const Paragraph = ({
  className,
  spacing = "default",
  ...props
}: ParagraphProps) => {
  const spacingClasses = {
    default: "mb-4",
    tight: "mb-2",
    loose: "mb-6",
  }[spacing];

  return (
    <Typography
      asChild
      className={cn(
        "leading-7 [&:not(:first-child)]:mt-6",
        spacingClasses,
        className,
      )}
      {...props}
    >
      <p />
    </Typography>
  );
};

type LinkProps = BaseTypographyProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href?: string;
    target?: string;
    rel?: string;
  };

const Link = ({ className, ...props }: LinkProps) => {
  return (
    <Typography
      asChild
      className={cn(
        "text-primary font-medium underline-offset-4 hover:underline",
        className,
      )}
      {...props}
    >
      <a />
    </Typography>
  );
};

export { Typography, Title, Text, Paragraph, Link };
export type {
  BaseTypographyProps,
  TitleProps,
  TextProps,
  ParagraphProps,
  LinkProps,
};
