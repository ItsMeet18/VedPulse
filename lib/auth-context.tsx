"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import {
  User,
  UserRole,
  LoginCredentials,
  RegisterPatientInput,
  authenticateUser,
  registerPatient,
  getSavedSession,
  saveSession,
  clearSession,
  initializeUserStore,
} from "@/lib/auth"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials, role: UserRole) => Promise<{ success: boolean; user?: User; error?: string }>
  register: (input: RegisterPatientInput) => Promise<{ success: boolean; user?: User; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    // Initialize seed users and restore active session if available
    const init = async () => {
      try {
        await initializeUserStore()
        const session = getSavedSession()
        if (session) {
          setUser(session)
        }
      } catch (err) {
        console.error("Failed to initialize auth state:", err)
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [])

  const login = async (credentials: LoginCredentials, role: UserRole) => {
    setIsLoading(true)
    try {
      const res = await authenticateUser(credentials, role)
      if (res.success && res.user) {
        setUser(res.user)
        saveSession(res.user)
        return { success: true, user: res.user }
      }
      return { success: false, error: res.error || "Authentication failed." }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (input: RegisterPatientInput) => {
    setIsLoading(true)
    try {
      const res = await registerPatient(input)
      if (res.success && res.user) {
        setUser(res.user)
        saveSession(res.user)
        return { success: true, user: res.user }
      }
      return { success: false, error: res.error || "Registration failed." }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    clearSession()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
