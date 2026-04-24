import type { MDXComponents } from "mdx/types";

import { cn } from "@acme/ui/lib/utils";

import { getIconForLanguageExtension } from "./components/icons";

const components: MDXComponents = {
  h1: ({ className, ...properties }: React.ComponentProps<"h1">) => (
    <h1
      className={cn(
        "font-heading mt-2 scroll-m-28 text-3xl font-bold tracking-tight",
        className,
      )}
      {...properties}
    />
  ),
  h2: ({ className, ...properties }: React.ComponentProps<"h2">) => {
    return (
      <h2
        id={properties.children
          ?.toString()
          .replaceAll(" ", "-")
          .replaceAll("'", "")
          .replaceAll("?", "")
          .toLowerCase()}
        className={cn(
          "font-heading [&+]*:[code]:text-xl mt-10 scroll-m-28 text-xl font-medium tracking-tight first:mt-0 lg:mt-16 [&+.steps]:mt-0! [&+.steps>h3]:mt-4! [&+h3]:mt-6! [&+p]:mt-4!",
          className,
        )}
        {...properties}
      />
    );
  },
  h3: ({ className, ...properties }: React.ComponentProps<"h3">) => (
    <h3
      className={cn(
        "font-heading mt-12 scroll-m-28 text-lg font-medium tracking-tight [&+p]:mt-4! *:[code]:text-xl",
        className,
      )}
      {...properties}
    />
  ),
  h4: ({ className, ...properties }: React.ComponentProps<"h4">) => (
    <h4
      className={cn(
        "font-heading mt-8 scroll-m-28 text-base font-medium tracking-tight",
        className,
      )}
      {...properties}
    />
  ),
  h5: ({ className, ...properties }: React.ComponentProps<"h5">) => (
    <h5
      className={cn(
        "mt-8 scroll-m-28 text-base font-medium tracking-tight",
        className,
      )}
      {...properties}
    />
  ),
  h6: ({ className, ...properties }: React.ComponentProps<"h6">) => (
    <h6
      className={cn(
        "mt-8 scroll-m-28 text-base font-medium tracking-tight",
        className,
      )}
      {...properties}
    />
  ),
  a: ({ className, ...properties }: React.ComponentProps<"a">) => (
    <a
      className={cn("font-medium underline underline-offset-4", className)}
      {...properties}
    />
  ),
  p: ({ className, ...properties }: React.ComponentProps<"p">) => (
    <p
      className={cn("leading-relaxed not-first:mt-6", className)}
      {...properties}
    />
  ),
  strong: ({ className, ...properties }: React.HTMLAttributes<HTMLElement>) => (
    <strong className={cn("font-medium", className)} {...properties} />
  ),
  ul: ({ className, ...properties }: React.ComponentProps<"ul">) => (
    <ul className={cn("my-6 ml-6 list-disc", className)} {...properties} />
  ),
  ol: ({ className, ...properties }: React.ComponentProps<"ol">) => (
    <ol className={cn("my-6 ml-6 list-decimal", className)} {...properties} />
  ),
  li: ({ className, ...properties }: React.ComponentProps<"li">) => (
    <li className={cn("mt-2", className)} {...properties} />
  ),
  blockquote: ({
    className,
    ...properties
  }: React.ComponentProps<"blockquote">) => (
    <blockquote
      className={cn("mt-6 border-l-2 pl-6 italic", className)}
      {...properties}
    />
  ),
  img: ({ className, alt, ...properties }: React.ComponentProps<"img">) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={cn("rounded-md", className)} alt={alt} {...properties} />
  ),
  hr: ({ ...properties }: React.ComponentProps<"hr">) => (
    <hr className="my-4 md:my-8" {...properties} />
  ),
  table: ({ className, ...properties }: React.ComponentProps<"table">) => (
    <div className="no-scrollbar my-6 w-full overflow-y-auto rounded-lg border">
      <table
        className={cn(
          "relative w-full overflow-hidden border-none text-sm [&_tbody_tr:last-child]:border-b-0",
          className,
        )}
        {...properties}
      />
    </div>
  ),
  tr: ({ className, ...properties }: React.ComponentProps<"tr">) => (
    <tr className={cn("m-0 border-b", className)} {...properties} />
  ),
  th: ({ className, ...properties }: React.ComponentProps<"th">) => (
    <th
      className={cn(
        "px-4 py-2 text-left font-bold [[align=center]]:text-center [[align=right]]:text-right",
        className,
      )}
      {...properties}
    />
  ),
  td: ({ className, ...properties }: React.ComponentProps<"td">) => (
    <td
      className={cn(
        "px-4 py-2 text-left whitespace-nowrap [[align=center]]:text-center [[align=right]]:text-right",
        className,
      )}
      {...properties}
    />
  ),
  pre: ({
    className,
    children,
    ...properties
  }: React.ComponentProps<"pre">) => {
    return (
      <pre
        className={cn(
          "no-scrollbar min-w-0 overflow-x-auto px-4 py-3.5 outline-none has-data-highlighted-line:px-0 has-data-line-numbers:px-0 has-data-[slot=tabs]:p-0",
          className,
        )}
        {...properties}
      >
        {children}
      </pre>
    );
  },
  figure: ({ className, ...properties }: React.ComponentProps<"figure">) => {
    return <figure className={cn(className)} {...properties} />;
  },
  figcaption: ({
    className,
    children,
    ...properties
  }: React.ComponentProps<"figcaption">) => {
    const iconExtension =
      "data-language" in properties &&
      typeof properties["data-language"] === "string"
        ? getIconForLanguageExtension(properties["data-language"])
        : undefined;

    return (
      <figcaption
        className={cn(
          "text-code-foreground [&_svg]:text-code-foreground flex items-center gap-2 [&_svg]:size-4 [&_svg]:opacity-70",
          className,
        )}
        {...properties}
      >
        {iconExtension}
        {children}
      </figcaption>
    );
  },
  code: ({
    className,
    __comp__,
    __src__,
    __from__,
    // __npm__,
    // __yarn__,
    // __pnpm__,
    // __bun__,
    ...properties
  }: React.ComponentProps<"code"> & {
    __comp__: React.FC;
    __src__?: string;
    __from__?: string; // ESM base URL (e.g., import.meta.url) for resolving relative src
    // __npm__?: string
    // __yarn__?: string
    // __pnpm__?: string
    // __bun__?: string
  }) => {
    // Inline Code.
    if (typeof properties.children === "string") {
      return (
        <code
          className={cn(
            "bg-muted relative rounded-md px-[0.3rem] py-[0.2rem] font-mono text-[0.8rem] wrap-break-word outline-none",
            className,
          )}
          {...properties}
        >
          {properties.children}
        </code>
      );
    }
    // Fallback render for non-string children (e.g., <code>asdasd</code> in MDX JSX)
    return (
      <code
        className={cn(
          "bg-muted relative rounded-md px-[0.3rem] py-[0.2rem] font-mono text-[0.8rem] wrap-break-word outline-none",
          className,
        )}
        {...properties}
      >
        {properties.children}
      </code>
    );
  },
};

export function useMDXComponents(): MDXComponents {
  return components;
}
