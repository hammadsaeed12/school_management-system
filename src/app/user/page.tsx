"use client"

import { useRouter } from "next/navigation"

import { UserRole } from "../types/user"
import { useUser } from "../context/UserContext"

const roles = [
  { name: "Teacher", value: UserRole.TEACHER },
  { name: "Admin", value: UserRole.ADMIN },
  { name: "Parent", value: UserRole.PARENT },
  { name: "Student", value: UserRole.STUDENT },
]

export default function UserPage() {
  const router = useRouter()
  const { user, setUserRole } = useUser()

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role)
    router.push(`/${role}`)
  }

  if (!user) {
    router.push("/login")
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Select Your Role</h1>
        <div className="space-y-4">
          {roles.map((role) => (
            <button
              key={role.value}
              onClick={() => handleRoleSelect(role.value)}
              className="w-full p-4 text-left rounded-md transition-colors bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              {role.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

