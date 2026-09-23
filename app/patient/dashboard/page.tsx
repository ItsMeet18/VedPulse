"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Upload,
  MessageCircle,
  Phone,
  Bell,
  User as UserIcon,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Leaf,
  LogOut,
  MapPin,
  Mail,
  ShieldCheck,
  RotateCw,
  Plus,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AuthGuard } from "@/components/auth-guard"
import { Appointment, AppointmentStatus, getAppointmentsForUser, cancelAppointment } from "@/lib/appointments"

export default function PatientDashboardPage() {
  return (
    <AuthGuard allowedRole="patient">
      <PatientDashboardContent />
    </AuthGuard>
  )
}

function PatientDashboardContent() {
  const [activeTab, setActiveTab] = useState("overview")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true)
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null)

  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  // Fetch real appointments booked by this patient
  const fetchPatientAppointments = async () => {
    if (!user) return
    setIsLoadingAppointments(true)
    try {
      const data = await getAppointmentsForUser(user)
      setAppointments(data)
    } catch (err) {
      console.error("Failed to load patient appointments", err)
    } finally {
      setIsLoadingAppointments(false)
    }
  }

  useEffect(() => {
    fetchPatientAppointments()
  }, [user])

  const handleCancel = async (aptId: string) => {
    if (!user) return
    const confirmed = window.confirm("Are you sure you want to cancel this appointment session?")
    if (!confirmed) return

    try {
      const res = await cancelAppointment(aptId, user)
      if (res.success) {
        setStatusFeedback("Appointment cancelled successfully.")
        await fetchPatientAppointments()
        setTimeout(() => setStatusFeedback(null), 3500)
      } else {
        alert(res.error || "Failed to cancel appointment")
      }
    } catch (e: any) {
      alert(e?.message || "Error cancelling appointment")
    }
  }

  // Active patient profile metadata
  const patientData = {
    name: user?.name || "Verified Patient",
    id: user?.id || "PAT123456",
    email: user?.email || "patient@vedpulse.com",
    age: user?.age || 35,
    location: user?.location || "Mumbai, Maharashtra",
    phone: user?.phone || "+91 9876543210",
    isDemo: !!user?.isDemo,
  }

  // Sort appointments by date
  const upcomingAppointments = appointments.filter(
    (a) => a.status === "confirmed" || a.status === "pending"
  )
  const completedAppointments = appointments.filter((a) => a.status === "completed")
  const nextAppointment = upcomingAppointments[0]

  // Dynamic progress calculation based on real patient appointments
  const totalBooked = appointments.filter((a) => a.status !== "cancelled").length
  const completedCount = completedAppointments.length
  const progressPercent = totalBooked > 0 ? Math.round((completedCount / totalBooked) * 100) : 0

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0 flex items-center gap-1 text-[11px] font-semibold">
            <CheckCircle className="h-3 w-3" /> Confirmed
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary" className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-0 flex items-center gap-1 text-[11px] font-semibold">
            <Clock className="h-3 w-3" /> Pending Confirmation
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="secondary" className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-0 flex items-center gap-1 text-[11px] font-semibold">
            <CheckCircle className="h-3 w-3" /> Completed
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="secondary" className="bg-destructive/15 text-destructive border-0 flex items-center gap-1 text-[11px] font-semibold">
            <XCircle className="h-3 w-3" /> Cancelled
          </Badge>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-accent/20">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
                <Leaf className="h-6 w-6 text-primary" />
                <span className="font-bold text-foreground">VedPulse</span>
              </Link>
              <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
                Patient Portal
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/40 border border-border/50">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                  {patientData.name.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-semibold leading-tight text-foreground">{patientData.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono leading-tight">{patientData.id}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-xs font-medium border-border/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
              >
                <LogOut className="h-3.5 w-3.5 mr-1.5" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome & Patient Profile Summary Section */}
        <div className="mb-8 p-6 rounded-2xl bg-card border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Welcome back, {patientData.name}!</h1>
              <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 flex items-center gap-1 text-xs">
                <ShieldCheck className="h-3 w-3" />
                Verified Patient
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              Track your Panchakarma therapies, attending Ayurvedic doctors, and clinical wellness history.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <div className="px-3 py-1.5 rounded-lg bg-accent/40 border border-border flex items-center gap-1.5">
              <UserIcon className="h-3.5 w-3.5 text-primary" />
              <span>Patient ID: <strong className="text-foreground font-mono">{patientData.id}</strong></span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-accent/40 border border-border flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-primary" />
              <span>{patientData.email}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPatientAppointments}
              className="h-auto py-1 px-2.5 text-xs text-primary hover:bg-primary/10"
            >
              <RotateCw className="h-3 w-3 mr-1" /> Refresh
            </Button>
          </div>
        </div>

        {statusFeedback && (
          <div className="mb-6 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{statusFeedback}</span>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">My Appointments ({appointments.length})</TabsTrigger>
            <TabsTrigger value="progress">Regimen Progress</TabsTrigger>
            <TabsTrigger value="documents">Health Records</TabsTrigger>
            <TabsTrigger value="diet">Prescribed Pathya</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* New / Clean Customer Callout (e.g. for meetshah.180106@gmail.com) */}
            {appointments.length === 0 && !isLoadingAppointments && (
              <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/15 via-accent/30 to-primary/10 border border-primary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" /> Welcome to Your Personal Wellness Portal!
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-xl">
                    You currently have no scheduled appointments. Begin your healing journey by booking an Abhyanga, Shirodhara, or comprehensive Panchakarma detox session with our senior Vaidyas.
                  </p>
                </div>
                <Link href="/appointments" className="shrink-0">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-10 px-5">
                    <Calendar className="h-4 w-4 mr-2" /> Book First Session
                  </Button>
                </Link>
              </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Next Scheduled Therapy */}
              <Card className="border-border/60 shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-card-foreground text-base">
                    <Calendar className="h-5 w-5 text-primary" />
                    Next Scheduled Therapy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {nextAppointment ? (
                    <div>
                      <p className="font-semibold text-base text-card-foreground">{nextAppointment.therapy}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        with {nextAppointment.doctorName}
                      </p>
                      <p className="text-xs font-medium text-primary mt-1">
                        {nextAppointment.date} at {nextAppointment.time}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        {getStatusBadge(nextAppointment.status)}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveTab("appointments")}
                          className="text-xs h-7"
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-xs text-muted-foreground mb-3">No upcoming appointments scheduled</p>
                      <Link href="/appointments">
                        <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs">
                          <Plus className="h-3.5 w-3.5 mr-1" /> Schedule Therapy
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Treatment Progress */}
              <Card className="border-border/60 shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-card-foreground text-base">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Regimen Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sessions Completed</span>
                      <span className="font-semibold text-card-foreground">
                        {completedCount} of {totalBooked}
                      </span>
                    </div>
                    <Progress value={progressPercent} className="h-2.5" />
                    <p className="text-xs text-muted-foreground">
                      {totalBooked > 0
                        ? `${progressPercent}% of booked Panchakarma therapies completed`
                        : "No active treatment regimen in progress."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-border/60 shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-card-foreground text-base">Quick Portal Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/appointments" className="block">
                    <Button variant="outline" size="sm" className="w-full justify-start bg-transparent hover:bg-accent/40 text-xs">
                      <Calendar className="h-4 w-4 mr-2 text-primary" />
                      Book New Session
                    </Button>
                  </Link>
                  <Link href="/chat" className="block">
                    <Button variant="outline" size="sm" className="w-full justify-start bg-transparent hover:bg-accent/40 text-xs">
                      <MessageCircle className="h-4 w-4 mr-2 text-primary" />
                      Ask AyurBot AI Assistant
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("documents")}
                    className="w-full justify-start bg-transparent hover:bg-accent/40 text-xs"
                  >
                    <Upload className="h-4 w-4 mr-2 text-primary" />
                    Upload Medical Records
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Appointments Preview */}
            <Card className="border-border/60 shadow-xs">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-card-foreground text-base">
                    <Calendar className="h-5 w-5 text-primary" />
                    Recent Scheduled Sessions
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Your direct appointments with certified Ayurvedic physicians
                  </CardDescription>
                </div>
                <Link href="/appointments">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8">
                    <Plus className="h-3.5 w-3.5 mr-1" /> New Booking
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {isLoadingAppointments ? (
                  <div className="py-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <RotateCw className="h-4 w-4 animate-spin text-primary" /> Loading sessions...
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-border rounded-xl bg-accent/10">
                    <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-sm">No Sessions Scheduled</p>
                    <p className="text-xs text-muted-foreground mt-0.5 mb-3">Book your initial consultation or customized Panchakarma procedure.</p>
                    <Link href="/appointments">
                      <Button size="sm" variant="outline" className="text-xs">
                        Book Appointment
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {appointments.slice(0, 4).map((apt) => (
                      <div
                        key={apt.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-accent/25 border border-border/40 gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-primary">{apt.id}</span>
                            <span className="font-semibold text-sm text-foreground">{apt.therapy}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            with <strong>{apt.doctorName}</strong> on {apt.date} at {apt.time}
                          </p>
                          {apt.notes && <p className="text-[11px] text-muted-foreground italic mt-0.5">Note: "{apt.notes}"</p>}
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {getStatusBadge(apt.status)}
                          {apt.status !== "cancelled" && apt.status !== "completed" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCancel(apt.id)}
                              className="h-7 px-2 text-[10px] text-destructive hover:bg-destructive/10"
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Full Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <Card className="border-border/60 shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-card-foreground text-base">Your Complete Appointment History</CardTitle>
                  <CardDescription className="text-xs">
                    View active sessions, review doctor remarks, and cancel upcoming appointments if needed.
                  </CardDescription>
                </div>
                <Link href="/appointments">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold h-9">
                    <Plus className="h-4 w-4 mr-1.5" /> Book Session
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-border rounded-xl bg-accent/10">
                    <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <h3 className="font-semibold text-sm">No Appointments on Record</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
                      You haven't scheduled any Panchakarma treatments yet. All future bookings will be saved here permanently.
                    </p>
                    <Link href="/appointments">
                      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold">
                        Schedule Your First Appointment
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {appointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="p-4 rounded-xl border border-border/60 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-primary">{apt.id}</span>
                            <span className="font-semibold text-sm">{apt.therapy}</span>
                            <Badge variant="secondary" className="text-[10px] bg-accent/40">{apt.therapyDuration || "60 min"}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Physician: <strong>{apt.doctorName}</strong> ({apt.doctorSpecialization || "Ayurvedic Physician"})
                          </p>
                          <p className="text-xs text-foreground font-medium">
                            Date: {apt.date} • Time Slot: {apt.time}
                          </p>
                          {apt.notes && (
                            <p className="text-xs text-muted-foreground italic bg-accent/20 p-2 rounded-md mt-1">
                              <strong>Remarks:</strong> {apt.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col sm:items-end gap-2 shrink-0">
                          {getStatusBadge(apt.status)}

                          {apt.status !== "cancelled" && apt.status !== "completed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancel(apt.id)}
                              className="text-xs h-7 text-destructive hover:bg-destructive/10 hover:border-destructive/40"
                            >
                              Cancel Session
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Regimen Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <Card className="border-border/60 shadow-xs">
              <CardHeader>
                <CardTitle className="text-card-foreground">Dosha Balance & Vitality Tracking</CardTitle>
                <CardDescription>Real-time analytics and recovery biomarkers recorded by your doctor.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-card-foreground text-sm">Biomarker Recovery Progression</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1 font-medium">
                            <span className="text-muted-foreground">Overall Regimen Completion</span>
                            <span className="text-card-foreground">{progressPercent}%</span>
                          </div>
                          <Progress value={progressPercent} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1 font-medium">
                            <span className="text-muted-foreground">Digestive Agni Strength</span>
                            <span className="text-card-foreground">78%</span>
                          </div>
                          <Progress value={78} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1 font-medium">
                            <span className="text-muted-foreground">Sleep Quality & Ojas</span>
                            <span className="text-card-foreground">82%</span>
                          </div>
                          <Progress value={82} className="h-2" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-card-foreground text-sm mb-3">Prakriti & Dosha Stability</h4>
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center p-2.5 rounded-lg bg-accent/20 border border-border/40">
                          <span className="text-sm font-medium">Vata (Air & Space)</span>
                          <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0">
                            Balanced
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center p-2.5 rounded-lg bg-accent/20 border border-border/40">
                          <span className="text-sm font-medium">Pitta (Fire & Water)</span>
                          <Badge variant="secondary" className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-0">
                            Moderating
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center p-2.5 rounded-lg bg-accent/20 border border-border/40">
                          <span className="text-sm font-medium">Kapha (Earth & Water)</span>
                          <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0">
                            Optimal
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Health Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card className="border-border/60 shadow-xs">
              <CardHeader>
                <CardTitle className="text-card-foreground">Diagnostic Lab Reports & Health History</CardTitle>
                <CardDescription>Securely share medical files with your attending Ayurvedic doctor.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-accent/10">
                  <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-card-foreground mb-1">Upload Diagnostic Documents</h3>
                  <p className="text-xs text-muted-foreground mb-4 max-w-sm mx-auto">
                    Supported formats: PDF, JPG, PNG (Prakriti charts, blood tests, previous prescription histories)
                  </p>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold">
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                    Select & Upload Files
                  </Button>
                </div>

                {patientData.isDemo && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-card-foreground text-sm mb-3">On-file Clinical Records</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-accent/20 border border-border/40">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-card-foreground">Initial Ayurvedic Assessment & Prakriti.pdf</span>
                        </div>
                        <span className="text-xs text-muted-foreground">Uploaded 2 days ago</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-accent/20 border border-border/40">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-card-foreground">Pre-treatment Blood Chemistry Panel.pdf</span>
                        </div>
                        <span className="text-xs text-muted-foreground">Uploaded 1 week ago</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prescribed Pathya (Diet Plan) */}
          <TabsContent value="diet" className="space-y-6">
            <Card className="border-border/60 shadow-xs">
              <CardHeader>
                <CardTitle className="text-card-foreground">Prescribed Pathya (Dietary Regimen)</CardTitle>
                <CardDescription>Customized nutritional guidelines based on your Panchakarma phase.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-accent/20 border border-border/40">
                    <h4 className="font-semibold text-card-foreground text-sm mb-2">Morning (6:30 AM - 9:00 AM)</h4>
                    <ul className="text-xs text-muted-foreground space-y-1.5">
                      <li>• Warm water with a pinch of dry ginger & cumin</li>
                      <li>• Moong dal kitchari with fresh cilantro</li>
                      <li>• Herbal Tulsi infusion (1 cup)</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl bg-accent/20 border border-border/40">
                    <h4 className="font-semibold text-card-foreground text-sm mb-2">Mid-Day (12:30 PM - 2:00 PM)</h4>
                    <ul className="text-xs text-muted-foreground space-y-1.5">
                      <li>• Steamed seasonal squashes & red rice</li>
                      <li>• Freshly prepared buttermilk (Takra) with roasted jeera</li>
                      <li>• Avoid iced drinks & processed oils</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl bg-accent/20 border border-border/40">
                    <h4 className="font-semibold text-card-foreground text-sm mb-2">Evening (6:30 PM - 8:00 PM)</h4>
                    <ul className="text-xs text-muted-foreground space-y-1.5">
                      <li>• Light vegetable soup (lauki/bottle gourd)</li>
                      <li>• Warm spiced milk with nutmeg before sleep</li>
                      <li>• Maintain 3-hour gap between meal and bedtime</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
