"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  Users,
  MessageCircle,
  FileText,
  Shield,
  Leaf,
  LogOut,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  ShieldCheck,
  Phone,
  Mail,
  Eye,
  Check,
  X,
  RotateCw,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AuthGuard } from "@/components/auth-guard"
import { Appointment, AppointmentStatus, getAppointmentsForUser, updateAppointmentStatus } from "@/lib/appointments"

export default function DoctorDashboardPage() {
  return (
    <AuthGuard allowedRole="doctor">
      <DoctorDashboardContent />
    </AuthGuard>
  )
}

function DoctorDashboardContent() {
  const [activeTab, setActiveTab] = useState("overview")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPatientApt, setSelectedPatientApt] = useState<Appointment | null>(null)
  const [statusActionFeedback, setStatusActionFeedback] = useState<string | null>(null)

  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  // Fetch real appointments assigned to this doctor
  const fetchDoctorAppointments = async () => {
    if (!user) return
    setIsLoadingAppointments(true)
    try {
      const data = await getAppointmentsForUser(user)
      setAppointments(data)
    } catch (err) {
      console.error("Failed to load doctor appointments", err)
    } finally {
      setIsLoadingAppointments(false)
    }
  }

  useEffect(() => {
    fetchDoctorAppointments()
  }, [user])

  // Handle status update
  const handleUpdateStatus = async (aptId: string, newStatus: AppointmentStatus) => {
    if (!user) return
    setStatusActionFeedback(null)
    try {
      const res = await updateAppointmentStatus(aptId, newStatus, user)
      if (res.success) {
        setStatusActionFeedback(`Appointment ${aptId} marked as ${newStatus.toUpperCase()}`)
        await fetchDoctorAppointments()
        setTimeout(() => setStatusActionFeedback(null), 3000)
      } else {
        alert(res.error || "Failed to update appointment status")
      }
    } catch (e: any) {
      alert(e?.message || "Error updating status")
    }
  }

  // Doctor profile metadata
  const doctorData = {
    name: user?.name || "Dr. Rajesh Sharma",
    id: user?.id || "DOC001",
    specialization: user?.specialization || "Chief Panchakarma Specialist",
    experience: user?.experience || "15+ Years",
    email: user?.email || "doctor@vedpulse.com",
  }

  // Format today's date for filter (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split("T")[0]

  // Dynamic calculations based strictly on appointments assigned to this doctor
  const todayAppointments = appointments.filter((a) => a.date === todayStr)
  const pendingAppointments = appointments.filter((a) => a.status === "pending")
  const completedAppointments = appointments.filter((a) => a.status === "completed")

  // Distinct patient records from this doctor's appointments
  const uniquePatientsMap = new Map<string, { patientId: string; name: string; email: string; phone?: string; lastAppointment: Appointment }>()
  for (const apt of appointments) {
    if (!uniquePatientsMap.has(apt.patientId)) {
      uniquePatientsMap.set(apt.patientId, {
        patientId: apt.patientId,
        name: apt.patientName,
        email: apt.patientEmail,
        phone: apt.patientPhone,
        lastAppointment: apt,
      })
    }
  }
  const uniquePatients = Array.from(uniquePatientsMap.values())

  const filteredPatients = uniquePatients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
            <Clock className="h-3 w-3" /> Pending Review
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="secondary" className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-0 flex items-center gap-1 text-[11px] font-semibold">
            <Check className="h-3 w-3" /> Completed
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
                Clinical Doctor Console
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/40 border border-border/50">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                  <Shield className="h-3.5 w-3.5" />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-semibold leading-tight text-foreground">{doctorData.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono leading-tight">{doctorData.id}</p>
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
        {/* Welcome Doctor Profile Section */}
        <div className="mb-8 p-6 rounded-2xl bg-card border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Welcome, {doctorData.name}</h1>
              <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 flex items-center gap-1 text-xs">
                <ShieldCheck className="h-3 w-3" />
                Authorized Clinical Account
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              {doctorData.specialization} • {doctorData.experience} Practice
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <div className="px-3 py-1.5 rounded-lg bg-accent/40 border border-border flex items-center gap-1.5">
              <span>Doctor ID: <strong className="text-foreground font-mono">{doctorData.id}</strong></span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-accent/40 border border-border flex items-center gap-1.5">
              <span>{doctorData.email}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDoctorAppointments}
              className="h-auto py-1 px-2.5 text-xs text-primary hover:bg-primary/10"
            >
              <RotateCw className="h-3 w-3 mr-1" /> Refresh
            </Button>
          </div>
        </div>

        {statusActionFeedback && (
          <div className="mb-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{statusActionFeedback}</span>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments Queue ({appointments.length})</TabsTrigger>
            <TabsTrigger value="patients">My Patient Registry ({uniquePatients.length})</TabsTrigger>
            <TabsTrigger value="reports">Clinical Notes & Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card className="border-border/60 shadow-xs">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Today's Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-card-foreground">{todayAppointments.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Scheduled for today</p>
                </CardContent>
              </Card>

              <Card className="border-border/60 shadow-xs">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Assigned Patients</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-card-foreground">{uniquePatients.length}</div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">Direct consultations</p>
                </CardContent>
              </Card>

              <Card className="border-border/60 shadow-xs">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending Action</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{pendingAppointments.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Awaiting confirmation</p>
                </CardContent>
              </Card>

              <Card className="border-border/60 shadow-xs">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completed Regimens</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{completedAppointments.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Successfully treated</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Schedule Queue */}
            <Card className="border-border/60 shadow-xs">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-card-foreground text-base">
                    <Calendar className="h-5 w-5 text-primary" />
                    Doctor's Appointment Queue
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Showing all patient appointments booked specifically with {doctorData.name}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("appointments")}
                  className="text-xs h-8"
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingAppointments ? (
                  <div className="py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <RotateCw className="h-4 w-4 animate-spin text-primary" /> Loading appointment records...
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-border rounded-xl bg-accent/10">
                    <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-sm">No Patient Appointments Yet</p>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                      When patients book appointments with {doctorData.name}, they will appear in this real-time queue.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {appointments.slice(0, 5).map((apt) => (
                      <div
                        key={apt.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-accent/25 border border-border/40 gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-xs font-mono font-bold text-primary px-2.5 py-1.5 rounded-md bg-primary/10 shrink-0">
                            {apt.time}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm text-card-foreground">{apt.patientName}</p>
                              <span className="text-[10px] font-mono text-muted-foreground">({apt.patientId})</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{apt.therapy} • {apt.date}</p>
                            {apt.notes && (
                              <p className="text-[11px] text-muted-foreground italic mt-0.5">Note: "{apt.notes}"</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {getStatusBadge(apt.status)}

                          {/* Quick Status Action Buttons */}
                          {apt.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(apt.id, "confirmed")}
                              className="h-7 px-2.5 text-[10px] bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                            >
                              Confirm
                            </Button>
                          )}
                          {apt.status === "confirmed" && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(apt.id, "completed")}
                              className="h-7 px-2.5 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                            >
                              Complete
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
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-card-foreground">All Assigned Appointments</CardTitle>
                <CardDescription className="text-xs">
                  Manage patient treatment schedules, review intake remarks, and update consultation statuses.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-border rounded-xl bg-accent/10">
                    <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-sm">No Appointments Found</p>
                    <p className="text-xs text-muted-foreground mt-1">You currently have 0 assigned appointments.</p>
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
                            <span className="font-semibold text-sm">{apt.patientName}</span>
                            <span className="text-xs text-muted-foreground font-mono">({apt.patientId})</span>
                          </div>
                          <p className="text-xs font-medium text-foreground">{apt.therapy}</p>
                          <p className="text-xs text-muted-foreground">
                            Date: <strong>{apt.date}</strong> at <strong>{apt.time}</strong> • Phone: {apt.patientPhone || "N/A"}
                          </p>
                          {apt.notes && (
                            <p className="text-xs text-muted-foreground italic bg-accent/20 p-2 rounded-md mt-1">
                              <strong>Patient Remarks:</strong> {apt.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col sm:items-end gap-2 shrink-0">
                          {getStatusBadge(apt.status)}

                          <div className="flex items-center gap-1.5 pt-1">
                            {apt.status !== "confirmed" && apt.status !== "completed" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(apt.id, "confirmed")}
                                className="h-7 px-2 text-[11px] text-emerald-600 hover:bg-emerald-500/10"
                              >
                                Mark Confirmed
                              </Button>
                            )}
                            {apt.status !== "completed" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(apt.id, "completed")}
                                className="h-7 px-2 text-[11px] text-blue-600 hover:bg-blue-500/10"
                              >
                                Mark Completed
                              </Button>
                            )}
                            {apt.status !== "cancelled" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleUpdateStatus(apt.id, "cancelled")}
                                className="h-7 px-2 text-[11px] text-destructive hover:bg-destructive/10"
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patient Registry Tab */}
          <TabsContent value="patients" className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patient by name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>
              <Badge variant="outline" className="text-xs">
                Total Patients: {uniquePatients.length}
              </Badge>
            </div>

            {filteredPatients.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-border rounded-xl bg-accent/10">
                <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="font-semibold text-sm">No Patients Registered Yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Patients who schedule appointments with {doctorData.name} will be cataloged here automatically.
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredPatients.map((patient) => (
                  <Card key={patient.patientId} className="border-border/60 shadow-xs hover:border-primary/40 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-sm">
                            {patient.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-card-foreground text-sm">{patient.name}</h3>
                            <p className="text-xs text-muted-foreground font-mono">
                              Patient ID: {patient.patientId}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-3 mt-1">
                              <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {patient.email}</span>
                              {patient.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {patient.phone}</span>}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-center">
                          <div className="text-right hidden sm:block text-xs">
                            <p className="font-medium text-foreground">Latest: {patient.lastAppointment.therapy}</p>
                            <p className="text-muted-foreground">{patient.lastAppointment.date}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedPatientApt(patient.lastAppointment)}
                            className="h-8 px-2.5 text-xs"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" /> View Record
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Patient Clinical Details Modal */}
            {selectedPatientApt && (
              <Card className="border-border/80 shadow-md mt-6 animate-in fade-in duration-200">
                <CardHeader className="pb-3 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base text-card-foreground">Patient Clinical File: {selectedPatientApt.patientName}</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedPatientApt(null)} className="h-7 w-7 p-0">
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2 p-3 rounded-lg bg-accent/20 border border-border/40">
                      <p><strong className="text-muted-foreground">Patient ID:</strong> <span className="font-mono font-semibold">{selectedPatientApt.patientId}</span></p>
                      <p><strong className="text-muted-foreground">Email:</strong> {selectedPatientApt.patientEmail}</p>
                      <p><strong className="text-muted-foreground">Contact Phone:</strong> {selectedPatientApt.patientPhone || "N/A"}</p>
                      <p><strong className="text-muted-foreground">Attending Doctor:</strong> {selectedPatientApt.doctorName}</p>
                    </div>
                    <div className="space-y-2 p-3 rounded-lg bg-accent/20 border border-border/40">
                      <p><strong className="text-muted-foreground">Scheduled Therapy:</strong> {selectedPatientApt.therapy}</p>
                      <p><strong className="text-muted-foreground">Date & Time:</strong> {selectedPatientApt.date} at {selectedPatientApt.time}</p>
                      <p><strong className="text-muted-foreground">Booking Status:</strong> {getStatusBadge(selectedPatientApt.status)}</p>
                      <p><strong className="text-muted-foreground">Clinical Remarks:</strong> {selectedPatientApt.notes || "None provided."}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Clinical Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card className="border-border/60 shadow-xs">
              <CardHeader>
                <CardTitle className="text-card-foreground text-base">Generate Clinical Panchakarma Report</CardTitle>
                <CardDescription className="text-xs">Issue digital consultation discharge summaries, herbal recipes, and dosha charts.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="patient-select" className="text-xs font-semibold">Select Patient</Label>
                      <Select defaultValue={uniquePatients[0]?.patientId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a patient" />
                        </SelectTrigger>
                        <SelectContent>
                          {uniquePatients.map((p) => (
                            <SelectItem key={p.patientId} value={p.patientId}>
                              {p.name} ({p.patientId})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="report-type" className="text-xs font-semibold">Report Type</Label>
                      <Select defaultValue="progress">
                        <SelectTrigger>
                          <SelectValue placeholder="Select report type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="progress">Weekly Detox Progress Report</SelectItem>
                          <SelectItem value="treatment">Panchakarma Treatment Discharge Summary</SelectItem>
                          <SelectItem value="prescription">Herbal Kashayam & Diet Prescription</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="report-notes" className="text-xs font-semibold">Physician Observations (Nadi Pariksha & Diet)</Label>
                    <Textarea
                      id="report-notes"
                      placeholder="Enter detailed observations, pulse findings, and post-care guidance..."
                      className="min-h-28 text-xs"
                      defaultValue="Patient shows significant reduction in Ama (toxins). Agni is steadily stabilizing. Recommend 3 more Abhyanga sessions with Dhanwantharam Thailam."
                    />
                  </div>

                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold">
                    <FileText className="h-3.5 w-3.5 mr-1.5" />
                    Sign & Issue Clinical Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
