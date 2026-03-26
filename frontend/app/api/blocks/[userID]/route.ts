import { NextRequest, NextResponse } from "next/server";
import { authenticatedBackendRequest, createProxyResponse } from "@/lib/backendAuth";

type RouteContext = {
  params: Promise<{ userID: string }>;
};

export async function DELETE(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { userID } = await context.params;
  if (!userID) {
    return NextResponse.json({ message: "userID is required" }, { status: 400 });
  }

  const result = await authenticatedBackendRequest(request, `/users/block/${userID}`, {
    method: "DELETE",
  });
  return createProxyResponse(result.backendResponse, result.tokenPair, result.clearCookies);
}
