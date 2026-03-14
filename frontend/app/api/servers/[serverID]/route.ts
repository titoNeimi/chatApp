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

  const result = await authenticatedBackendRequest(request, `/server/${serverID}`);
  return createProxyResponse(result.backendResponse, result.tokenPair, result.clearCookies);
}

export async function PUT(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { serverID } = await context.params;
  if (!serverID) {
    return NextResponse.json({ message: "serverID is required" }, { status: 400 });
  }

  const body = await request.json();
  const result = await authenticatedBackendRequest(request, `/server/${serverID}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return createProxyResponse(result.backendResponse, result.tokenPair, result.clearCookies);
}

export async function DELETE(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { serverID } = await context.params;
  if (!serverID) {
    return NextResponse.json({ message: "serverID is required" }, { status: 400 });
  }

  const result = await authenticatedBackendRequest(request, `/server/${serverID}`, {
    method: "DELETE",
  });
  return createProxyResponse(result.backendResponse, result.tokenPair, result.clearCookies);
}
