import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";
import { headers } from "next/headers";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Log all cookies for debugging
    console.log("Cookies:", Object.fromEntries(
      Object.entries(Object.fromEntries(
        new Headers(headers()).entries()
      )).filter(([key]) => key.toLowerCase().includes('cookie'))
    ));
    
    console.log("Session:", session);

    if (!session || !session.user) {
      // In production, return an error instead of a fallback user
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
    });
  } catch (error) {
    console.error("Error in /api/auth/me:", error);
    return NextResponse.json(
      { 
        error: "An error occurred while fetching user data",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 