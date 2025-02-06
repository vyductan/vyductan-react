import { NextResponse } from "next/server";
import { createI18nMiddleware } from "next-international/middleware";

import { auth } from "@acme/auth";

import { env } from "./env";

// import { auth } from "@acme/auth";

const I18nMiddleware = createI18nMiddleware({
  locales: ["en", "vi"],
  defaultLocale: "en",
  urlMappingStrategy: "rewriteDefault",
});
export default auth((request) => {
  const nextUrl = request.nextUrl;

  /**
   * Rewrite URL
   */
  // Get hostname of request (e.g. demo.vercel.pub, demo.localhost:3000)
  let hostname = request.headers
    .get("host")
    ?.replace(
      `.localhost:${env.PORT ?? 3000}`,
      `.${env.NEXT_PUBLIC_ROOT_DOMAIN}`,
    );

  // special case for Vercel preview deployment URLs
  if (
    hostname &&
    hostname.includes("---") &&
    hostname.endsWith(`.${env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX}`)
  ) {
    hostname = `${hostname.split("---")[0]}.${env.NEXT_PUBLIC_ROOT_DOMAIN}`;
  }

  const searchParams = request.nextUrl.searchParams.toString();
  // Get the pathname of the request (e.g. /, /about, /blog/first-post)
  const path = `${nextUrl.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ""
  }`;

  // rewrites for app pages
  if (hostname == `app.${env.NEXT_PUBLIC_ROOT_DOMAIN}`) {
    /**
     * I18n auto set lang path
     * only for app.* domain
     */
    const i18nResponse = I18nMiddleware(request);
    // To get current url in server side
    i18nResponse.headers.set("x-url", request.url);
    // Temporary redirect (no need add local when NextResponse.(redirect|rewrite))
    if (i18nResponse.status === 307) {
      return i18nResponse;
    }

    // const session = req.auth;
    // if (!session && !path.includes("/signin")) {
    //   const redirectUrl = new URL("/signin", req.url);
    //   redirectUrl.searchParams.append("callbackUrl", nextUrl.href);
    //   return NextResponse.redirect(redirectUrl);
    // } else if (session && path.includes("/signin")) {
    //   return NextResponse.redirect(new URL("/", req.url));
    // }
    return NextResponse.rewrite(
      new URL(`/app${path === "/" ? "" : path}`, request.url),
    );
  }

  // rewrite root application to `/home` folder
  console.log(
    "xxxxxx",
    hostname,
    env.NEXT_PUBLIC_ROOT_DOMAIN,
    path,
    request.url,
  );
  if (
    hostname === `localhost:${env.PORT ?? 3000}` ||
    hostname === env.NEXT_PUBLIC_ROOT_DOMAIN
  ) {
    return NextResponse.rewrite(
      new URL(`/home${path === "/" ? "" : path}`, request.url),
    );
  }

  // rewrite everything else to `/[domain]/[slug] dynamic route
  return NextResponse.rewrite(new URL(`/${hostname}${path}`, request.url));
});

export const config = {
  /*
   * Match all paths except for:
   * 1. /api routes
   * 2. /_next (Next.js internals)
   * 3. /_static (inside /public)
   * 4. all root files inside /public (e.g. /favicon.ico)
   */
  // eslint-disable-next-line unicorn/prefer-string-raw
  matcher: ["/((?!api/|_next/|_static/|_vercel/|[\\w-]+\\.\\w+).*)"],
  // matcher: [String.raw`/((?!api/|_next/|_static/|_vercel/|[\w-]+\.\w+).*)`],
  // matcher: [String.raw`/((?!api/|_next/|_static/|_vercel/|[\w-]+\.\w+).*)`],
};

// // Or like this if you need to do something here.
// // export default auth((req) => {
// //   console.log(req.auth) //  { session: { user: { ... } } }
// // })
//
// // Read more: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
// export const config = {
//   matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
// };
