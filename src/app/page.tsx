import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const headersList = headers();
  const { userId, sessionClaims } = await auth(headersList);
  
  if (!userId) {
    return redirect("/sign-in");
  }
  
  const role = (sessionClaims?.metadata as { role?: string })?.role || "student";
  
  // Redirect to the appropriate dashboard based on user role
  // All paths are within the (dashboard) route group but don't need to include (dashboard) in the URL
  switch (role) {
    case "admin":
      return redirect("/admin");
    case "teacher":
      return redirect("/teacher");
    case "parent":
      return redirect("/parent");
    case "student":
      return redirect("/student");
    default:
      return redirect("/student"); // Default to student dashboard
  }
}