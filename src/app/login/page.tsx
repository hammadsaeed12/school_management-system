"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
// import { useUser } from "../contexts/UserContext"
import Image from "next/image"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()
  // const { login } = useUser()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Simple validation
    if (username === "user" && password === "password") {
      // login(username)
      router.push("/user")
    } else {
      setError("Invalid username or password")
    }
  }}