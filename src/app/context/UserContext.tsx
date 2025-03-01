"use client"


import { createContext, useState, useContext, type ReactNode } from "react"
import { UserRole } from "../types/roles"
import { User } from "../types/user"


interface UserContextType {
  user: User | null
  login: (username: string) => void
  logout: () => void
  setUserRole: (role: UserRole) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = (username: string) => {
    setUser({ username, role: null })
  }

  const logout = () => {
    setUser(null)
  }

  const setUserRole = (role: UserRole) => {
    if (user) {
      setUser({ ...user, role })
    }
  }

  return <UserContext.Provider value={{ user, login, logout, setUserRole }}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}

