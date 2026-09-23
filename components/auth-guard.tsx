"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { UserRole } from "@/lib/auth"
import { Leaf, ShieldAlert } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  allowedRole: UserRole
}

export function AuthGuard({ children, allowedRole }: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        const fullPath = typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : "/"
        router.replace(`/login?redirect=${encodeURIComponent(fullPath || "/")}`)
      } else if (user.role !== allowedRole) {
        if (user.role === "patient") {
          router.replace("/patient/dashboard")
        } else if (user.role === "doctor") {
          router.replace("/doctor/dashboard")
        } else {
          router.replace("/login")
        }
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRole, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-4">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <Leaf className="h-6 w-6 text-primary absolute animate-pulse" />
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Verifying security credentials...
        </p>
      </div>
    )
  }

  if (!isAuthenticated || !user || user.role !== allowedRole) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
        <div className="max-w-md w-full text-center space-y-4 p-6 rounded-2xl bg-card border border-border shadow-lg">
          <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold">Access Restricted</h2>
          <p className="text-sm text-muted-foreground">
            You must be logged in with an authorized {allowedRole} account to view this page. Redirecting to login...
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
