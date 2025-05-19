import type { LinkProps as NextLinkProps } from "next/link";
import type { AnchorHTMLAttributes, DetailedHTMLProps } from "react";
import { forwardRef, useEffect, useState } from "react";

// import NextLink from "next/link";
// import { Link as RrdLink } from "react-router-dom";

type LinkProps = NextLinkProps &
  Omit<
    DetailedHTMLProps<
      AnchorHTMLAttributes<HTMLAnchorElement>,
      HTMLAnchorElement
    >,
    "href"
  >;
// const X = globalThis.next ? NextLink : RrdLink;
const Link = forwardRef(({ href, ...props }: LinkProps, ref) => {
  const isNextJs = (
    globalThis as unknown as {
      next: { version: string; appDir: boolean } | undefined;
    }
  ).next;

  // return <X href={href} to={""} {...props} />;
  const [X, setX] = useState("div" as any);
  useEffect(() => {
    const fn = async () => {
      await (isNextJs
        ? import("next/link").then((x) => {
            setX(x.default);
          })
        : import("react-router-dom").then((x) => {
            setX(x.Link);
          }));
    };
    void fn();
  }, [isNextJs]);
  // return (
  //   <>
  //     haha
  //     <X to="ads" />
  //   </>
  // );
  return isNextJs ? (
    <X ref={ref} href={href} {...props} />
  ) : (
    <X
      ref={ref}
      to={typeof href === "string" ? href : (href.href ?? "")}
      {...props}
    />
  );
});
export { Link };
