import { NextRequest, NextResponse } from "next/server";
import { authenticatedBackendRequest, createProxyResponse } from "@/lib/backendAuth";

type RouteContext = {
  params: Promise<{ userID: string }>;
};

export async function GET(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { userID } = await context.params;
  if (!userID) {
    return NextResponse.json({ message: "userID is required" }, { status: 400 });
  }

  const result = await authenticatedBackendRequest(request, `/users/${userID}`);
  return createProxyResponse(result.backendResponse, result.tokenPair, result.clearCookies);
}

export async function PUT(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { userID } = await context.params;
  if (!userID) {
    return NextResponse.json({ message: "userID is required" }, { status: 400 });
  }

  const body = await request.json();
  const result = await authenticatedBackendRequest(request, `/users/${userID}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return createProxyResponse(result.backendResponse, result.tokenPair, result.clearCookies);
}

export async function DELETE(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { userID } = await context.params;
  if (!userID) {
    return NextResponse.json({ message: "userID is required" }, { status: 400 });
  }

  const result = await authenticatedBackendRequest(request, `/users/${userID}`, {
    method: "DELETE",
  });
  return createProxyResponse(result.backendResponse, result.tokenPair, result.clearCookies);
}
