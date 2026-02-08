import { NextRequest, NextResponse } from "next/server";
import { authenticatedBackendRequest, createProxyResponse } from "@/lib/backendAuth";

type RouteContext = {
  params: Promise<{ serverID: string }>;
};

export async function GET(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { serverID } = await context.params;
  if (!serverID) {
    return NextResponse.json({ message: "serverID is required" }, { status: 400 });
  }

  const result = await authenticatedBackendRequest(request, `/server/${serverID}/room`);
  return createProxyResponse(result.backendResponse, result.tokenPair, result.clearCookies);
}
