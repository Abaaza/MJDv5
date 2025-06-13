"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { loginUser, registerUser, updateProfile, changePassword } from "@/lib/api"

interface User {
  id: string
  name: string
  guests: number
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, guests: number) => Promise<void>
  updateName: (name: string) => Promise<void>
  changePassword: (current: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => {},
  register: async () => {},
  updateName: async () => {},
  changePassword: async () => {},
  logout: () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("auth")
    if (stored) {
      const parsed = JSON.parse(stored)
      setUser(parsed.user)
      setToken(parsed.token)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const res = await loginUser(email, password)
    setUser(res.user)
    setToken(res.token)
    localStorage.setItem("auth", JSON.stringify(res))
  }

  const register = async (name: string, email: string, password: string, guests: number) => {
    const res = await registerUser(name, email, password, guests)
    setUser(res.user)
    setToken(res.token)
    localStorage.setItem("auth", JSON.stringify(res))
  }

  const updateName = async (name: string) => {
    if (!token) return
    const res = await updateProfile(name, token)
    setUser(res.user)
    setToken(res.token)
    localStorage.setItem("auth", JSON.stringify(res))
  }

  const changePasswordFn = async (current: string, password: string) => {
    if (!token) return
    await changePassword(current, password, token)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("auth")
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, updateName, changePassword: changePasswordFn, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
