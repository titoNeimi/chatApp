import { NextRequest, NextResponse } from "next/server";

export const ACCESS_TOKEN_COOKIE = "chatapp_access_token";
export const REFRESH_TOKEN_COOKIE = "chatapp_refresh_token";

const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 15;
const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

type AuthenticatedRequestResult = {
  backendResponse: Response;
  tokenPair: TokenPair | null;
  clearCookies: boolean;
  accessTokenUsed: string;
};

function getBackendURL(): string {
  const backendURL = process.env.API_URL ?? process.env.NEXT_PUBLIC_APIURL;
  if (!backendURL) {
    throw new Error("Missing API_URL or NEXT_PUBLIC_APIURL");
  }
  return backendURL.replace(/\/+$/, "");
}

function getCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export function applyAuthCookies(response: NextResponse, tokenPair: TokenPair | null, clearCookies: boolean): void {
  if (clearCookies) {
    response.cookies.set(ACCESS_TOKEN_COOKIE, "", getCookieOptions(0));
    response.cookies.set(REFRESH_TOKEN_COOKIE, "", getCookieOptions(0));
    return;
  }

  if (!tokenPair) {
    return;
  }

  response.cookies.set(
    ACCESS_TOKEN_COOKIE,
    tokenPair.accessToken,
    getCookieOptions(ACCESS_TOKEN_MAX_AGE_SECONDS),
  );
  response.cookies.set(
    REFRESH_TOKEN_COOKIE,
    tokenPair.refreshToken,
    getCookieOptions(REFRESH_TOKEN_MAX_AGE_SECONDS),
  );
}

export async function createProxyResponse(
  backendResponse: Response,
  tokenPair: TokenPair | null,
  clearCookies: boolean,
): Promise<NextResponse> {
  const contentType = backendResponse.headers.get("content-type");
  const rawBody = await backendResponse.text();

  const response = new NextResponse(rawBody || null, {
    status: backendResponse.status,
    headers: contentType ? { "content-type": contentType } : undefined,
  });

  applyAuthCookies(response, tokenPair, clearCookies);
  return response;
}

function unauthorizedResponse(message: string): Response {
  return new Response(JSON.stringify({ message }), {
    status: 401,
    headers: { "content-type": "application/json" },
  });
}

async function callBackend(path: string, init?: RequestInit): Promise<Response> {
  const url = `${getBackendURL()}${path}`;
  return fetch(url, { cache: "no-store", ...init });
}

async function refreshToken(refreshTokenValue: string): Promise<TokenPair | null> {
  const response = await callBackend("/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshTokenValue }),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { access_token: string; refresh_token: string };
  if (!data.access_token || !data.refresh_token) {
    return null;
  }

  return { accessToken: data.access_token, refreshToken: data.refresh_token };
}

export async function authenticatedBackendRequest(
  request: NextRequest,
  path: string,
  init: RequestInit = {},
): Promise<AuthenticatedRequestResult> {
  let accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value ?? "";
  const refreshTokenValue = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value ?? "";
  let tokenPair: TokenPair | null = null;
  let hasRefreshed = false;

  if (!accessToken && refreshTokenValue) {
    tokenPair = await refreshToken(refreshTokenValue);
    hasRefreshed = true;
    if (tokenPair) {
      accessToken = tokenPair.accessToken;
    }
  }

  if (!accessToken) {
    return {
      backendResponse: unauthorizedResponse("unauthorized"),
      tokenPair,
      clearCookies: Boolean(refreshTokenValue),
      accessTokenUsed: "",
    };
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);
  const firstResponse = await callBackend(path, { ...init, headers });

  if (firstResponse.status !== 401) {
    return {
      backendResponse: firstResponse,
      tokenPair,
      clearCookies: false,
      accessTokenUsed: accessToken,
    };
  }

  if (!refreshTokenValue || hasRefreshed) {
    return {
      backendResponse: firstResponse,
      tokenPair,
      clearCookies: true,
      accessTokenUsed: accessToken,
    };
  }

  tokenPair = await refreshToken(refreshTokenValue);
  if (!tokenPair) {
    return {
      backendResponse: firstResponse,
      tokenPair: null,
      clearCookies: true,
      accessTokenUsed: accessToken,
    };
  }

  const retryHeaders = new Headers(init.headers);
  retryHeaders.set("Authorization", `Bearer ${tokenPair.accessToken}`);
  const retryResponse = await callBackend(path, { ...init, headers: retryHeaders });

  return {
    backendResponse: retryResponse,
    tokenPair,
    clearCookies: retryResponse.status === 401,
    accessTokenUsed: tokenPair.accessToken,
  };
}

export async function backendRequest(path: string, init: RequestInit = {}): Promise<Response> {
  return callBackend(path, init);
}
