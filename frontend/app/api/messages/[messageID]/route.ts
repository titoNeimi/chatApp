import { NextRequest, NextResponse } from "next/server";
import { authenticatedBackendRequest, createProxyResponse } from "@/lib/backendAuth";

type RouteContext = {
  params: Promise<{ messageID: string }>;
};

export async function PUT(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { messageID } = await context.params;
  if (!messageID) {
    return NextResponse.json({ message: "messageID is required" }, { status: 400 });
  }

  const body = await request.json();
  const result = await authenticatedBackendRequest(request, `/message/${messageID}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return createProxyResponse(result.backendResponse, result.tokenPair, result.clearCookies);
}

export async function DELETE(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { messageID } = await context.params;
  if (!messageID) {
    return NextResponse.json({ message: "messageID is required" }, { status: 400 });
  }

  const result = await authenticatedBackendRequest(request, `/message/${messageID}`, {
    method: "DELETE",
  });
  return createProxyResponse(result.backendResponse, result.tokenPair, result.clearCookies);
}
