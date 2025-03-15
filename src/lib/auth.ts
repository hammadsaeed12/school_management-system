import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";

// This function replaces Clerk's auth() function with NextAuth's equivalent
export async function auth() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return {
      userId: null,
      sessionClaims: {
        metadata: {
          role: null
        }
      }
    };
  }
  
  // Return in a format compatible with how Clerk's auth was used
  return {
    userId: session.user.id,
    sessionClaims: {
      metadata: {
        role: session.user.role
      }
    }
  };
}

// This function replaces Clerk's currentUser() function with NextAuth's equivalent
export async function currentUser() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return null;
  }
  
  // Return in a format compatible with how Clerk's currentUser was used
  return {
    id: session.user.id,
    firstName: session.user.name?.split(' ')[0] || '',
    lastName: session.user.name?.split(' ')[1] || '',
    emailAddresses: [{ emailAddress: session.user.email }],
    publicMetadata: {
      role: session.user.role
    }
  };
} 