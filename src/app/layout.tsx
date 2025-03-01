import type React from "react"
import "./globals.css"
import { UserProvider } from "./context/UserContext"

export const metadata = {
  title: "School Application",
  description: "A school management system",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <UserProvider>
        <body>{children}</body>
      </UserProvider>
    </html>
  )
}

