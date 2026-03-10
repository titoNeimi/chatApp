import { authenticatedBackendRequest, createProxyResponse } from "@/lib/backendAuth";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ serverID: string }>;
};

export async function POST(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { serverID } = await context.params;
  if (!serverID) {
    return NextResponse.json({ message: "serverID is required" }, { status: 400 });
  }

  const result = await authenticatedBackendRequest(request, `/server/${serverID}/join`, {method:'POST'});
  return createProxyResponse(result.backendResponse, result.tokenPair, result.clearCookies);
}
