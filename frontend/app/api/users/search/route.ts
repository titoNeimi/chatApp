import { NextRequest, NextResponse } from "next/server";
import { authenticatedBackendRequest, createProxyResponse } from "@/lib/backendAuth";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const qs = searchParams.toString();
  const result = await authenticatedBackendRequest(request, `/users/search${qs ? `?${qs}` : ""}`);
  return createProxyResponse(result.backendResponse, result.tokenPair, result.clearCookies);
}