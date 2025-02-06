import NextAuth from "next-auth";

import { authConfig } from "./config";

export type { Session } from "next-auth";

const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

export { handlers, auth, signIn, signOut };

export {
  invalidateSessionToken,
  validateToken,
  isSecureContext,
} from "./config";
// import type { NextAuthResult } from "next-auth";
// import NextAuth from "next-auth";
//
// import { authConfig } from "./config";
//
// export type { Session } from "next-auth";
//
// const x = NextAuth(authConfig);
// const { handlers, signIn, signOut } = NextAuth(authConfig);
// const auth: NextAuthResult["auth"] = x.auth;
//
// export { handlers, auth, signIn, signOut };
//
// export {
//   invalidateSessionToken,
//   validateToken,
//   isSecureContext,
// } from "./config";
