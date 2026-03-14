import { NextRequest, NextResponse } from "next/server";
import { authenticatedBackendRequest, createProxyResponse } from "@/lib/backendAuth";

type RouteContext = {
  params: Promise<{ serverID: string; userID: string }>;
};

export async function POST(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { serverID, userID } = await context.params;
  if (!serverID || !userID) {
    return NextResponse.json({ message: "serverID and userID are required" }, { status: 400 });
  }

  const body = await request.json();
  const result = await authenticatedBackendRequest(request, `/server/${serverID}/bans`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, user_id: userID }),
  });
  return createProxyResponse(result.backendResponse, result.tokenPair, result.clearCookies);
}

export async function DELETE(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { serverID, userID } = await context.params;
  if (!serverID || !userID) {
    return NextResponse.json({ message: "serverID and userID are required" }, { status: 400 });
  }

  const result = await authenticatedBackendRequest(request, `/server/${serverID}/bans/${userID}`, {
    method: "DELETE",
  });
  return createProxyResponse(result.backendResponse, result.tokenPair, result.clearCookies);
}
