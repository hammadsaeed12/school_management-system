import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { routeAccessMap } from "./lib/setting";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  
  // If user is not logged in, redirect to sign-in page
  if (!token) {
    const signInUrl = new URL("/sign-in", request.url);
    return NextResponse.redirect(signInUrl);
  }

  const role = token.role as string;
  const path = request.nextUrl.pathname;

  // Check if the user has access to the requested route
  for (const [route, allowedRoles] of Object.entries(routeAccessMap)) {
    const regex = new RegExp(`^${route.replace(/\(.*\)/g, "")}`);
    if (regex.test(path) && !allowedRoles.includes(role)) {
      // Redirect to the user's role-specific dashboard
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|api/auth|sign-in|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};

