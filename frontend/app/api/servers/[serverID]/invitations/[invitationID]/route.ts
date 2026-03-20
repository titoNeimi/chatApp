import { NextRequest, NextResponse } from "next/server";
import { authenticatedBackendRequest, createProxyResponse } from "@/lib/backendAuth";

type RouteContext = {
  params: Promise<{ serverID: string; invitationID: string }>;
};

export async function DELETE(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { serverID, invitationID } = await context.params;
  if (!serverID || !invitationID) {
    return NextResponse.json({ message: "serverID and invitationID are required" }, { status: 400 });
  }

  const result = await authenticatedBackendRequest(
    request,
    `/server/${serverID}/invitations/${invitationID}`,
    { method: "DELETE" }
  );
  return createProxyResponse(result.backendResponse, result.tokenPair, result.clearCookies);
}
