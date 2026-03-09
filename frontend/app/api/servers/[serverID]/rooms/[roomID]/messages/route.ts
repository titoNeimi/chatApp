import { NextRequest, NextResponse } from "next/server";
import { authenticatedBackendRequest, createProxyResponse } from "@/lib/backendAuth";

type RouteContext = {
  params: Promise<{ serverID: string, roomID: string }>;
};

export async function GET(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { serverID, roomID } = await context.params;
  if (!serverID || !roomID) {
    return NextResponse.json({ message: "serverID and roomID are required" }, { status: 400 });
  }

  const result = await authenticatedBackendRequest(request, `/message/room/${roomID}`);
  return createProxyResponse(result.backendResponse, result.tokenPair, result.clearCookies);
}

export async function POST(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { serverID, roomID } = await context.params;
  if (!serverID || !roomID) {
    return NextResponse.json({ message: "serverID and roomID are required" }, { status: 400 });
  }

  const body = await request.json();
  const result = await authenticatedBackendRequest(request, `/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, room_id: roomID }),
  });
  return createProxyResponse(result.backendResponse, result.tokenPair, result.clearCookies);
}
