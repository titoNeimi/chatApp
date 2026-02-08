import { NextRequest, NextResponse } from "next/server";
import { applyAuthCookies, backendRequest, createProxyResponse } from "@/lib/backendAuth";

type LoginPayload = {
  email: string;
  password: string;
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  let payload: LoginPayload;
  try {
    payload = (await request.json()) as LoginPayload;
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const backendResponse = await backendRequest("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!backendResponse.ok) {
    return createProxyResponse(backendResponse, null, false);
  }

  const data = (await backendResponse.json()) as { access_token?: string; refresh_token?: string };
  if (!data.access_token || !data.refresh_token) {
    return NextResponse.json({ message: "Invalid login response from backend" }, { status: 502 });
  }

  const response = NextResponse.json({ ok: true });
  applyAuthCookies(
    response,
    {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    },
    false,
  );
  return response;
}
