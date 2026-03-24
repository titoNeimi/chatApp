import { NextRequest, NextResponse } from "next/server";
import { authenticatedBackendRequest, createProxyResponse } from "@/lib/backendAuth";

type RouteContext = {
  params: Promise<{ friendshipID: string }>;
};

export async function DELETE(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { friendshipID } = await context.params;
  if (!friendshipID) {
    return NextResponse.json({ message: "friendshipID is required" }, { status: 400 });
  }

  const result = await authenticatedBackendRequest(request, `/friends/${friendshipID}`, {
    method: "DELETE",
  });
  return createProxyResponse(result.backendResponse, result.tokenPair, result.clearCookies);
}