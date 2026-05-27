import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("oc_admin")?.value;

  if (!token || !(await verifySession(token))) {
    const response = NextResponse.redirect(new URL("/admin", request.url));
    response.cookies.delete("oc_admin");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/dashboard/:path*"],
};
