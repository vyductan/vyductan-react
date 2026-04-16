import * as React from "react";

import { cn } from "../../lib/utils";

type BaseTypographyProperties = React.HTMLAttributes<HTMLElement> & {
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
  // mark = false,
  onClick,
  strong = false,
  italic = false,
  type,
  underline = false,
  ...properties
}: BaseTypographyProperties) => {
  const Comp = del ? "del" : "span";

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
    // "leading-relaxed",
    code && "bg-muted relative rounded px-[0.3em] py-[0.2em] font-mono text-sm",
    disabled && "cursor-not-allowed opacity-50",
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
      ...properties,
    });
  }

  return (
    <Comp
      data-component="typography"
      className={classes}
      onClick={onClick}
      {...properties}
    >
      {children}
    </Comp>
  );
};

type TitleProperties = BaseTypographyProperties & {
  level?: 1 | 2 | 3 | 4 | 5;
};

const Title = ({
  level = 1,
  className,
  children,
  ...properties
}: TitleProperties) => {
  const Component = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5";

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
      {...properties}
    >
      <Component>{children}</Component>
    </Typography>
  );
};

type TextProperties = BaseTypographyProperties & {
  keyboard?: boolean;
};

const Text = ({
  className,
  keyboard = false,
  mark,
  children,
  ...properties
}: TextProperties) => {
  return (
    <Typography
      className={cn(
        keyboard &&
          "rounded border border-b-2 border-neutral-200 bg-neutral-100 px-1.5 py-0.5 font-mono text-xs dark:border-neutral-700 dark:bg-neutral-800",
        className,
      )}
      {...properties}
    >
      {mark ? (
        <mark className="bg-yellow-100 dark:bg-yellow-900/50">{children}</mark>
      ) : (
        children
      )}
    </Typography>
  );
};

type ParagraphProperties = BaseTypographyProperties & {
  spacing?: "default" | "tight" | "loose";
};

const Paragraph = ({
  className,
  spacing = "default",
  ...properties
}: ParagraphProperties) => {
  const spacingClasses = {
    default: "mb-4",
    tight: "mb-2",
    loose: "mb-6",
  }[spacing];

  return (
    <Typography
      asChild
      className={cn("not-first:mt-6", spacingClasses, className)}
      {...properties}
    >
      <p />
    </Typography>
  );
};

type LinkProperties = BaseTypographyProperties &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href?: string;
    target?: string;
    rel?: string;
  };

const Link = ({ className, children, ...properties }: LinkProperties) => {
  return (
    <Typography
      asChild
      className={cn("font-medium text-primary underline underline-offset-4", className)}
      {...properties}
    >
      <a>{children}</a>
    </Typography>
  );
};

export { Typography, Title, Text, Paragraph, Link };
export type {
  BaseTypographyProperties as BaseTypographyProps,
  TitleProperties as TitleProps,
  TextProperties as TextProps,
  ParagraphProperties as ParagraphProps,
  LinkProperties as LinkProps,
};
