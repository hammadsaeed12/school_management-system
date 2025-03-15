import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";

// This would typically connect to your database
const mockUsers = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123", // In a real app, this would be hashed
    role: "admin",
  },
  {
    id: "2",
    name: "Teacher User",
    email: "teacher@example.com",
    password: "teacher123",
    role: "teacher",
  },
  {
    id: "3",
    name: "Student User",
    email: "student@example.com",
    password: "student123",
    role: "student",
  },
  {
    id: "4",
    name: "Parent User",
    email: "parent@example.com",
    password: "parent123",
    role: "parent",
  },
];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = mockUsers.find(
          (user) => user.email === credentials.email
        );

        if (user && user.password === credentials.password) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key",
}; 