import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  applyAuthCookies,
  backendRequest,
  createProxyResponse,
} from "@/lib/backendAuth";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value ?? "";

  if (!refreshToken) {
    const response = NextResponse.json({ ok: true });
    applyAuthCookies(response, null, true);
    return response;
  }

  const backendResponse = await backendRequest("/auth/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!backendResponse.ok && backendResponse.status !== 401) {
    return createProxyResponse(backendResponse, null, true);
  }

  const response = NextResponse.json({ ok: true });
  applyAuthCookies(response, null, true);
  return response;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.json({ ok: true });
  if (request.cookies.get(ACCESS_TOKEN_COOKIE) || request.cookies.get(REFRESH_TOKEN_COOKIE)) {
    applyAuthCookies(response, null, true);
  }
  return response;
}
