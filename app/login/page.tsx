"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Leaf, User, Shield, ArrowLeft, AlertCircle, CheckCircle2, KeyRound, Loader2, Sparkles, Calendar, Stethoscope } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const searchParams = useSearchParams()
  const redirectUrl = searchParams?.get("redirect") || ""
  const roleParam = searchParams?.get("role") || searchParams?.get("type")

  const [userType, setUserType] = useState<"patient" | "doctor" | null>(() => {
    if (roleParam === "doctor") return "doctor"
    if (roleParam === "patient" || redirectUrl.includes("appointment")) return "patient"
    return null
  })

  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    age: "",
    location: "",
    address: "",
    phone: "",
  })

  const router = useRouter()
  const { login, register, isAuthenticated, user } = useAuth()

  // If already authenticated, redirect to destination or dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      if (redirectUrl && redirectUrl.startsWith("/")) {
        router.push(redirectUrl)
      } else if (user.role === "patient") {
        router.push("/patient/dashboard")
      } else if (user.role === "doctor") {
        router.push("/doctor/dashboard")
      }
    }
  }, [isAuthenticated, user, redirectUrl, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userType) return

    setError(null)
    setSuccessMsg(null)
    setIsSubmitting(true)

    try {
      const res = await login(
        {
          identifier: formData.email,
          password: formData.password,
        },
        userType
      )

      if (!res.success) {
        setError(res.error || "Authentication failed. Please check your credentials.")
        return
      }

      // Successful login redirect
      if (redirectUrl && redirectUrl.startsWith("/")) {
        router.push(redirectUrl)
      } else if (userType === "patient") {
        router.push("/patient/dashboard")
      } else if (userType === "doctor") {
        router.push("/doctor/dashboard")
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during login.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setIsSubmitting(true)

    try {
      const res = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        age: formData.age ? Number(formData.age) : undefined,
        phone: formData.phone,
        location: formData.location,
        address: formData.address,
      })

      if (!res.success) {
        setError(res.error || "Registration failed. Please review your inputs.")
        return
      }

      setSuccessMsg(
        `Account created successfully! Patient ID: ${res.user?.id}. Proceeding to ${
          redirectUrl ? "your requested page" : "dashboard"
        }...`
      )
      setTimeout(() => {
        if (redirectUrl && redirectUrl.startsWith("/")) {
          router.push(redirectUrl)
        } else {
          router.push("/patient/dashboard")
        }
      }, 1400)
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during registration.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Quick-fill helpers for demo accounts
  const quickFillPatient = (email: string = "patient@vedpulse.com") => {
    setFormData((prev) => ({
      ...prev,
      email,
      password: "Password@123",
    }))
    setError(null)
  }

  const quickFillDoctor = (email: string) => {
    setFormData((prev) => ({
      ...prev,
      email,
      password: "Doctor@123",
    }))
    setError(null)
  }

  if (!userType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-accent/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-4 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Leaf className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">VedPulse Panchakarma</h1>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Secure Portal Access</h2>
            <p className="text-muted-foreground text-sm">Please select your portal role to continue</p>
          </div>

          {redirectUrl && (
            <div className="mb-6 p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-foreground flex items-center gap-2.5">
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              <span>Please sign in or create an account to book your therapy session.</span>
            </div>
          )}

          <div className="space-y-4">
            <Card
              className="cursor-pointer border-2 hover:border-primary transition-all duration-200 hover:shadow-md group"
              onClick={() => {
                setUserType("patient")
                setError(null)
              }}
            >
              <CardHeader className="text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                  <User className="h-7 w-7" />
                </div>
                <CardTitle className="text-card-foreground text-lg">Patient Portal</CardTitle>
                <CardDescription>Book therapies, access appointments, detox charts & medical records</CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="cursor-pointer border-2 hover:border-primary transition-all duration-200 hover:shadow-md group"
              onClick={() => {
                setUserType("doctor")
                setError(null)
              }}
            >
              <CardHeader className="text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                  <Shield className="h-7 w-7" />
                </div>
                <CardTitle className="text-card-foreground text-lg">Doctor & Practitioner Portal</CardTitle>
                <CardDescription>Manage clinical records, appointments, and treatment prescriptions</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-accent/20 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center mb-4">
          <Button
            variant="ghost"
            onClick={() => {
              setUserType(null)
              setError(null)
              setSuccessMsg(null)
            }}
            className="mb-3 text-muted-foreground hover:text-primary text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Switch Account Type
          </Button>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Leaf className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">VedPulse</h1>
          </div>
          <Badge variant="secondary" className="bg-primary/15 text-primary border border-primary/20 font-medium px-3 py-1">
            {userType === "patient" ? "Patient Access Portal" : "Practitioner Medical Portal"}
          </Badge>
        </div>

        {/* Redirect Notice Banner */}
        {redirectUrl && (
          <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/25 text-xs text-foreground flex items-center gap-2.5 animate-in fade-in">
            <Calendar className="h-4 w-4 text-primary shrink-0" />
            <span className="font-medium">Sign in below to proceed directly to booking your session.</span>
          </div>
        )}

        {/* Status Alerts */}
        {error && (
          <div className="p-3.5 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{successMsg}</div>
          </div>
        )}

        {userType === "patient" ? (
          <Tabs
            value={isLogin ? "login" : "register"}
            onValueChange={(value) => {
              setIsLogin(value === "login")
              setError(null)
              setSuccessMsg(null)
            }}
          >
            <TabsList className="grid w-full grid-cols-2 mb-3">
              <TabsTrigger value="login">Authorized Login</TabsTrigger>
              <TabsTrigger value="register">Register New</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="border border-border/80 shadow-md">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Patient Login</CardTitle>
                  <CardDescription>Enter your registered Email or Patient ID and secure password.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email or Patient ID</Label>
                      <Input
                        id="email"
                        name="email"
                        type="text"
                        placeholder="e.g. PAT123456 or patient@vedpulse.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                      </div>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Verifying Credentials...
                        </>
                      ) : (
                        redirectUrl ? "Login & Continue to Booking" : "Login to Patient Portal"
                      )}
                    </Button>
                  </form>

                  {/* Demo Credentials Box */}
                  <div className="mt-5 p-3.5 rounded-xl bg-accent/35 border border-border/70 text-xs space-y-2">
                    <div className="flex items-center justify-between font-semibold text-foreground">
                      <span className="flex items-center gap-1.5 text-primary">
                        <KeyRound className="h-3.5 w-3.5" />
                        Demo Patient Account (Password: <code className="font-mono">Password@123</code>):
                      </span>
                    </div>

                    <div className="pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => quickFillPatient("patient@vedpulse.com")}
                        className="w-full h-auto py-1.5 px-2.5 text-left flex items-center justify-between text-[11px] bg-background hover:bg-primary/10 hover:border-primary/40"
                      >
                        <span className="font-semibold text-foreground flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-primary" /> John Doe (Demo Patient)
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">patient@vedpulse.com</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="border border-border/80 shadow-md">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Patient Registration</CardTitle>
                  <CardDescription>Create your account to obtain a Patient ID and book therapies.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-3.5">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="e.g. John Doe"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          name="age"
                          type="number"
                          placeholder="e.g. 32"
                          value={formData.age}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="+91 9876543210"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="location">City, State</Label>
                      <Input
                        id="location"
                        name="location"
                        type="text"
                        placeholder="e.g. Mumbai, Maharashtra"
                        value={formData.location}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="e.g. yourname@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="password">Password (min 6 chars)</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 mt-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        redirectUrl ? "Register & Continue to Booking" : "Register Patient Account"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="border border-border/80 shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Doctor Portal Login</CardTitle>
              <CardDescription>Authorized clinical access for certified Ayurvedic doctors.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Doctor ID or Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="text"
                    placeholder="e.g. dr.sharma@vedpulse.com or DOC001"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter doctor password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying Doctor Authorization...
                    </>
                  ) : (
                    "Login to Doctor Portal"
                  )}
                </Button>
              </form>

              {/* Demo Doctors Helper Box */}
              <div className="mt-5 p-3.5 rounded-xl bg-accent/35 border border-border/70 text-xs space-y-2">
                <div className="flex items-center justify-between font-semibold text-foreground">
                  <span className="flex items-center gap-1.5 text-primary">
                    <Stethoscope className="h-3.5 w-3.5" />
                    Demo Doctor Accounts (Password: <code className="font-mono">Doctor@123</code>):
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-1.5 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => quickFillDoctor("dr.sharma@vedpulse.com")}
                    className="h-auto py-1.5 px-2.5 text-left flex items-center justify-between text-[11px] bg-background hover:bg-primary/10 hover:border-primary/40"
                  >
                    <div>
                      <span className="font-semibold text-foreground block">Dr. Rajesh Sharma (DOC001)</span>
                      <span className="text-[10px] text-muted-foreground font-mono">dr.sharma@vedpulse.com</span>
                    </div>
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0.5">Panchakarma Chief</Badge>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => quickFillDoctor("dr.patel@vedpulse.com")}
                    className="h-auto py-1.5 px-2.5 text-left flex items-center justify-between text-[11px] bg-background hover:bg-primary/10 hover:border-primary/40"
                  >
                    <div>
                      <span className="font-semibold text-foreground block">Dr. Priya Patel (DOC002)</span>
                      <span className="text-[10px] text-muted-foreground font-mono">dr.patel@vedpulse.com</span>
                    </div>
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0.5">Physician & Nutritionist</Badge>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => quickFillDoctor("dr.singh@vedpulse.com")}
                    className="h-auto py-1.5 px-2.5 text-left flex items-center justify-between text-[11px] bg-background hover:bg-primary/10 hover:border-primary/40"
                  >
                    <div>
                      <span className="font-semibold text-foreground block">Dr. Amit Singh (DOC003)</span>
                      <span className="text-[10px] text-muted-foreground font-mono">dr.singh@vedpulse.com</span>
                    </div>
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0.5">Detox Specialist</Badge>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center pt-2">
          <p className="text-xs text-muted-foreground">
            Protected by VedPulse Medical Security. Need support?{" "}
            <a href="mailto:support@vedpulse.com" className="text-primary hover:underline font-medium">
              support@vedpulse.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
