import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret });
  const role = token?.role as "owner" | "employee" | undefined;

  const { pathname } = req.nextUrl;

  const ownerPaths =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/employees") ||
    pathname.startsWith("/attendance") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/settings");

  const employeePaths = pathname === "/checkin" || pathname.startsWith("/checkin/") || pathname === "/history";

  if (ownerPaths) {
    if (!token || role !== "owner") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  if (employeePaths) {
    if (!token || role !== "employee") {
      return NextResponse.redirect(new URL("/employee-login", req.url));
    }
  }

  if ((pathname === "/login" || pathname === "/register") && token && role === "owner") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (pathname === "/employee-login" && token && role === "employee") {
    return NextResponse.redirect(new URL("/checkin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/employees/:path*",
    "/attendance/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/checkin",
    "/checkin/:path*",
    "/history",
    "/login",
    "/register",
    "/employee-login",
  ],
};
