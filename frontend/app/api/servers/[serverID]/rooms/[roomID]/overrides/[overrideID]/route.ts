import { NextRequest, NextResponse } from "next/server";
import { authenticatedBackendRequest, createProxyResponse } from "@/lib/backendAuth";

type RouteContext = {
  params: Promise<{ serverID: string; roomID: string; overrideID: string }>;
};

export async function DELETE(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { serverID, roomID, overrideID } = await context.params;
  if (!serverID || !roomID || !overrideID) {
    return NextResponse.json({ message: "serverID, roomID and overrideID are required" }, { status: 400 });
  }

  const result = await authenticatedBackendRequest(
    request,
    `/server/${serverID}/room/${roomID}/overrides/${overrideID}`,
    { method: "DELETE" },
  );
  return createProxyResponse(result.backendResponse, result.tokenPair, result.clearCookies);
}
