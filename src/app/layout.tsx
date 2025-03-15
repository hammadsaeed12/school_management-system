import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientToastContainer from "@/components/ClientToastContainer";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "@/components/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SchooLama - School Management System",
  description: "A comprehensive school management system for administrators, teachers, students, and parents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html lang="en" className={inter.variable}>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body className="font-sans antialiased">
          {children}
          <ClientToastContainer />
        </body>
      </html>
    </AuthProvider>
  );
}
