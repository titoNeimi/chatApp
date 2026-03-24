import { NextRequest, NextResponse } from "next/server";
import { authenticatedBackendRequest, createProxyResponse } from "@/lib/backendAuth";

type RouteContext = {
  params: Promise<{ requestID: string }>;
};

export async function POST(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { requestID } = await context.params;
  if (!requestID) {
    return NextResponse.json({ message: "requestID is required" }, { status: 400 });
  }

  const result = await authenticatedBackendRequest(request, `/friends/request/${requestID}/decline`, {
    method: "POST",
  });
  return createProxyResponse(result.backendResponse, result.tokenPair, result.clearCookies);
}