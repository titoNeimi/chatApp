import { NextRequest, NextResponse } from "next/server";
import { authenticatedBackendRequest, createProxyResponse } from "@/lib/backendAuth";

type RouteContext = {
  params: Promise<{ serverID: string; userID: string; roleID: string }>;
};

export async function DELETE(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { serverID, userID, roleID } = await context.params;
  if (!serverID || !userID || !roleID) {
    return NextResponse.json({ message: "serverID, userID and roleID are required" }, { status: 400 });
  }

  const result = await authenticatedBackendRequest(request, `/server/${serverID}/roles/revoke`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userID, role_id: roleID }),
  });
  return createProxyResponse(result.backendResponse, result.tokenPair, result.clearCookies);
}
