"use client" // Error components must be Client Components

import { useEffect } from "react"
import { useClerk } from "@clerk/nextjs"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { session } = useClerk()

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Dashboard Route Error:", error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-4 rounded-full bg-red-100 p-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-red-500"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Oops! Something went wrong</h2>
          <p className="mt-2 text-center text-gray-600">
            We apologize for the inconvenience. An error occurred in this part of the application.
          </p>
          {error.digest && (
            <p className="mt-2 text-sm text-gray-500">
              Error ID: <code className="rounded bg-gray-100 px-1 py-0.5">{error.digest}</code>
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => reset()}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Try again
          </button>
          {session && (
            <button
              onClick={() => (window.location.href = "/")}
              className="w-full rounded-md bg-gray-200 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Return to Home
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

