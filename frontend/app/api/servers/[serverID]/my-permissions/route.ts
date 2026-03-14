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

  const roomID = request.nextUrl.searchParams.get("roomID");
  const backendPath = roomID
    ? `/server/${serverID}/my-permissions?roomID=${roomID}`
    : `/server/${serverID}/my-permissions`;

  const result = await authenticatedBackendRequest(request, backendPath);
  return createProxyResponse(result.backendResponse, result.tokenPair, result.clearCookies);
}
