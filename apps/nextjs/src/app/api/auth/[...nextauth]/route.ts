import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { handlers, isSecureContext } from "@acme/auth";

const EXPO_COOKIE_NAME = "__acme-expo-redirect-state";
const AUTH_COOKIE_PATTERN = /authjs\.session-token=([^;]+)/;

/**
 * Noop in production.
 *
 * In development, rewrite the request URL to use localhost instead of host IP address
 * so that Expo Auth works without getting trapped by Next.js CSRF protection.
 * @param req The request to modify
 * @returns The modified request.
 */
function rewriteRequestUrlInDevelopment(request: NextRequest) {
  if (isSecureContext) return request;

  const host = request.headers.get("host");
  const newURL = new URL(request.url);
  newURL.host = host ?? request.nextUrl.host;
  return new NextRequest(newURL, request);
}

async function handleExpoSigninCallback(
  request: NextRequest,
  redirectURL: string,
) {
  const cookieStore = await cookies();
  cookieStore.delete(EXPO_COOKIE_NAME);

  // Run original handler, then extract the session token from the response
  // Send it back via a query param in the Expo deep link. The Expo app
  // will then get that and set it in the session storage.
  const authResponse = await handlers.POST(request);
  const setCookie = authResponse.headers
    .getSetCookie()
    .find((cookie) => AUTH_COOKIE_PATTERN.test(cookie));
  const match = setCookie?.match(AUTH_COOKIE_PATTERN)?.[1];

  if (!match)
    throw new Error(
      "Unable to find session cookie: " +
        JSON.stringify(authResponse.headers.getSetCookie()),
    );

  const url = new URL(redirectURL);
  url.searchParams.set("session_token", match);

  return NextResponse.redirect(url);
}

export const POST = async (
  _request: NextRequest,
  props: { params: { nextauth: string[] } },
) => {
  // First step must be to correct the request URL.
  const request = rewriteRequestUrlInDevelopment(_request);

  const nextauthAction = props.params.nextauth[0];
  const cookieStore = await cookies();
  const isExpoCallback = cookieStore.get(EXPO_COOKIE_NAME);

  // callback handler required separately in the POST handler
  // since Apple sends a POST request instead of a GET
  if (nextauthAction === "callback" && !!isExpoCallback) {
    return handleExpoSigninCallback(request, isExpoCallback.value);
  }

  return handlers.POST(request);
};

export const GET = async (
  _request: NextRequest,
  props: { params: { nextauth: string[] } },
) => {
  // First step must be to correct the request URL.
  const request = rewriteRequestUrlInDevelopment(_request);

  const nextauthAction = props.params.nextauth[0];
  const isExpoSignIn = request.nextUrl.searchParams.get("expo-redirect");
  const cookieStore = await cookies();
  const isExpoCallback = cookieStore.get(EXPO_COOKIE_NAME);

  if (nextauthAction === "signin" && !!isExpoSignIn) {
    // set a cookie we can read in the callback
    // to know to send the user back to expo
    cookieStore.set({
      name: EXPO_COOKIE_NAME,
      value: isExpoSignIn,
      maxAge: 60 * 10, // 10 min
      path: "/",
    });
  }

  if (nextauthAction === "callback" && !!isExpoCallback) {
    return handleExpoSigninCallback(request, isExpoCallback.value);
  }

  // Every other request just calls the default handler
  return handlers.GET(request);
};
