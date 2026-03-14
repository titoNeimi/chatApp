import { NextRequest, NextResponse } from "next/server";
import { authenticatedBackendRequest, createProxyResponse } from "@/lib/backendAuth";

type RouteContext = {
  params: Promise<{ userID: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { userID } = await context.params;
  if (!userID) {
    return NextResponse.json({ message: "userID is required" }, { status: 400 });
  }

  const body = await request.json();
  const result = await authenticatedBackendRequest(request, `/users/${userID}/role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return createProxyResponse(result.backendResponse, result.tokenPair, result.clearCookies);
}
