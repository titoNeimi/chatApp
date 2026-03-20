import { NextRequest, NextResponse } from "next/server";
import { authenticatedBackendRequest, createProxyResponse } from "@/lib/backendAuth";

type RouteContext = {
  params: Promise<{ code: string }>;
};

export async function POST(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { code } = await context.params;
  if (!code) {
    return NextResponse.json({ message: "code is required" }, { status: 400 });
  }

  const result = await authenticatedBackendRequest(request, `/invitations/${code}/use`, {
    method: "POST",
  });
  return createProxyResponse(result.backendResponse, result.tokenPair, result.clearCookies);
}
