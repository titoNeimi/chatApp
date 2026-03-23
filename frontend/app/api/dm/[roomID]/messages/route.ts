import { NextRequest, NextResponse } from "next/server";
import { authenticatedBackendRequest, createProxyResponse } from "@/lib/backendAuth";

type RouteContext = {
  params: Promise<{ roomID: string }>;
};

export async function GET(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { roomID } = await context.params;
  if (!roomID) {
    return NextResponse.json({ message: "roomID is required" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const qs = searchParams.toString();
  const result = await authenticatedBackendRequest(request, `/message/room/${roomID}${qs ? `?${qs}` : ""}`);
  return createProxyResponse(result.backendResponse, result.tokenPair, result.clearCookies);
}

export async function POST(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { roomID } = await context.params;
  if (!roomID) {
    return NextResponse.json({ message: "roomID is required" }, { status: 400 });
  }

  const body = await request.json();
  const result = await authenticatedBackendRequest(request, "/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, room_id: roomID }),
  });
  return createProxyResponse(result.backendResponse, result.tokenPair, result.clearCookies);
}
