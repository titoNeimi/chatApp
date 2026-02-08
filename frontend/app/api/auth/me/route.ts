import { NextRequest, NextResponse } from "next/server";
import { authenticatedBackendRequest, createProxyResponse } from "@/lib/backendAuth";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const result = await authenticatedBackendRequest(request, "/auth/me");
  return createProxyResponse(result.backendResponse, result.tokenPair, result.clearCookies);
}
