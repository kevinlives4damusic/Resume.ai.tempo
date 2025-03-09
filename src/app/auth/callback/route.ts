import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const redirect_to = requestUrl.searchParams.get("redirect_to");

  // URL to redirect to after sign in process completes
  const redirectTo = redirect_to || "/dashboard";
  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
}
