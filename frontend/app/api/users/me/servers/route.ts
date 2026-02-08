import { NextRequest, NextResponse } from "next/server";
import { authenticatedBackendRequest, backendRequest, createProxyResponse } from "@/lib/backendAuth";
import { User } from "@/types/user";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await authenticatedBackendRequest(request, "/auth/me");
  if (!authResult.backendResponse.ok) {
    return createProxyResponse(authResult.backendResponse, authResult.tokenPair, authResult.clearCookies);
  }

  const user = (await authResult.backendResponse.json()) as User;
  if (!user?.id) {
    return NextResponse.json({ message: "Invalid user payload from backend" }, { status: 502 });
  }

  const backendResponse = await backendRequest(`/users/${user.id}/servers`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${authResult.accessTokenUsed}`,
    },
  });

  return createProxyResponse(
    backendResponse,
    authResult.tokenPair,
    authResult.clearCookies || backendResponse.status === 401,
  );
}
