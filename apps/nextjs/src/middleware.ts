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

export { auth as default } from "@acme/auth";
