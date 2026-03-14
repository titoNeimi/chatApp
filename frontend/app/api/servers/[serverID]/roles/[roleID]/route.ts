import { NextRequest, NextResponse } from "next/server";
import { authenticatedBackendRequest, createProxyResponse } from "@/lib/backendAuth";

type RouteContext = {
  params: Promise<{ serverID: string; roleID: string }>;
};

export async function PUT(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { serverID, roleID } = await context.params;
  if (!serverID || !roleID) {
    return NextResponse.json({ message: "serverID and roleID are required" }, { status: 400 });
  }

  const body = await request.json();
  const result = await authenticatedBackendRequest(request, `/server/${serverID}/roles/${roleID}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return createProxyResponse(result.backendResponse, result.tokenPair, result.clearCookies);
}

export async function DELETE(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { serverID, roleID } = await context.params;
  if (!serverID || !roleID) {
    return NextResponse.json({ message: "serverID and roleID are required" }, { status: 400 });
  }

  const result = await authenticatedBackendRequest(request, `/server/${serverID}/roles/${roleID}`, {
    method: "DELETE",
  });
  return createProxyResponse(result.backendResponse, result.tokenPair, result.clearCookies);
}
