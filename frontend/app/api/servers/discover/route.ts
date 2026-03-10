import { authenticatedBackendRequest, createProxyResponse } from "@/lib/backendAuth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const result = await authenticatedBackendRequest(request, `/server`);
  return createProxyResponse(result.backendResponse, result.tokenPair, result.clearCookies);
}
