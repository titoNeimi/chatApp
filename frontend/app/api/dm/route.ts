import { NextRequest, NextResponse } from "next/server";
import { authenticatedBackendRequest, createProxyResponse } from "@/lib/backendAuth";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const result = await authenticatedBackendRequest(request, "/dm");
  return createProxyResponse(result.backendResponse, result.tokenPair, result.clearCookies);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  const result = await authenticatedBackendRequest(request, "/dm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return createProxyResponse(result.backendResponse, result.tokenPair, result.clearCookies);
}
