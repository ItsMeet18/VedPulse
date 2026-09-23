"use client"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, User as UserIcon, ArrowLeft, CheckCircle, AlertCircle, Leaf, ShieldCheck, CheckCircle2, Sparkles, Loader2, Stethoscope } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AuthGuard } from "@/components/auth-guard"
import { getRegisteredDoctors, User } from "@/lib/auth"
import { createAppointment, checkSlotAvailability } from "@/lib/appointments"

export default function AppointmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <AuthGuard allowedRole="patient">
        <AppointmentBookingContent />
      </AuthGuard>
    </Suspense>
  )
}

function AppointmentBookingContent() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialTherapyParam = searchParams?.get("therapy") || ""
  const initialDoctorParam = searchParams?.get("doctor") || ""

  const [doctorsList, setDoctorsList] = useState<User[]>([])
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [selectedTherapy, setSelectedTherapy] = useState("")
  const [selectedDoctorId, setSelectedDoctorId] = useState("")
  const [patientNotes, setPatientNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [isBooked, setIsBooked] = useState(false)
  const [confirmedApt, setConfirmedApt] = useState<any>(null)

  const therapies = [
    { id: "abhyanga", name: "Abhyanga (Warm Oil Massage)", description: "Full body warm herbal oil massage restoring vitality & nervous balance", duration: "60 min" },
    { id: "shirodhara", name: "Shirodhara (Nervous Care)", description: "Continuous stream of medicated oils for deep mental calming & sleep", duration: "45 min" },
    { id: "basti", name: "Basti Karma (Core Detox)", description: "Herbal medicated internal bio-cleansing & joint rejuvenation", duration: "90 min" },
    { id: "nasya", name: "Nasya Therapy (Sinus & ENT)", description: "Nasal administration of herbal oils for sinus clarity & cervical relief", duration: "30 min" },
    { id: "virechana", name: "Virechana (Pitta Cleanse)", description: "Targeted metabolic & cellular toxin purgation", duration: "120 min" },
  ]

  const defaultTimeSlots = ["9:00 AM", "10:30 AM", "12:00 PM", "2:00 PM", "3:30 PM", "5:00 PM"]
  const [slotAvailability, setSlotAvailability] = useState<Record<string, { available: number; total: number }>>({})

  // Load doctors from registry
  useEffect(() => {
    const fetchDoctors = async () => {
      const docs = await getRegisteredDoctors()
      setDoctorsList(docs)

      if (initialDoctorParam && docs.length > 0) {
        const match = docs.find(
          (d) =>
            d.id.toLowerCase() === initialDoctorParam.toLowerCase() ||
            d.name.toLowerCase().includes(initialDoctorParam.toLowerCase()) ||
            (initialDoctorParam === "dr-sharma" && d.id === "DOC001") ||
            (initialDoctorParam === "dr-patel" && d.id === "DOC002") ||
            (initialDoctorParam === "dr-singh" && d.id === "DOC003")
        )
        if (match) setSelectedDoctorId(match.id)
      } else if (docs.length > 0 && !selectedDoctorId) {
        setSelectedDoctorId(docs[0].id)
      }
    }

    fetchDoctors()
  }, [initialDoctorParam])

  // Preselect therapy from search params
  useEffect(() => {
    if (initialTherapyParam) {
      const match = therapies.find(
        (t) =>
          t.id.toLowerCase() === initialTherapyParam.toLowerCase() ||
          t.name.toLowerCase().includes(initialTherapyParam.toLowerCase())
      )
      if (match) setSelectedTherapy(match.name)
    } else if (!selectedTherapy) {
      setSelectedTherapy(therapies[0].name)
    }
  }, [initialTherapyParam])

  // Update slot availability dynamically when doctor or date changes
  useEffect(() => {
    const updateSlots = async () => {
      if (!selectedDoctorId || !selectedDate) {
        setSlotAvailability({})
        return
      }

      const map: Record<string, { available: number; total: number }> = {}
      for (const time of defaultTimeSlots) {
        const avail = await checkSlotAvailability(selectedDoctorId, selectedDate, time)
        map[time] = avail
      }
      setSlotAvailability(map)
    }

    updateSlots()
  }, [selectedDoctorId, selectedDate])

  const selectedDoctorObj = doctorsList.find((d) => d.id === selectedDoctorId)
  const selectedTherapyObj = therapies.find((t) => t.name === selectedTherapy)

  const handleBookAppointment = async () => {
    if (!user) return
    setBookingError(null)

    if (!selectedTherapy) {
      setBookingError("Please select a Panchakarma therapy.")
      return
    }

    if (!selectedDoctorObj) {
      setBookingError("Please choose an attending Ayurvedic doctor.")
      return
    }

    if (!selectedDate) {
      setBookingError("Please choose an appointment date.")
      return
    }

    if (!selectedTime) {
      setBookingError("Please select an available time slot.")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await createAppointment(
        {
          doctorId: selectedDoctorObj.id,
          doctorName: selectedDoctorObj.name,
          doctorSpecialization: selectedDoctorObj.specialization,
          therapy: selectedTherapy,
          therapyDuration: selectedTherapyObj?.duration || "60 min",
          date: selectedDate,
          time: selectedTime,
          notes: patientNotes,
        },
        user
      )

      if (!res.success || !res.appointment) {
        setBookingError(res.error || "Failed to book appointment. Please check details.")
        return
      }

      setConfirmedApt(res.appointment)
      setIsBooked(true)
    } catch (err: any) {
      setBookingError(err?.message || "An unexpected error occurred during booking.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isBooked && confirmedApt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-accent/20 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full border-border/70 shadow-lg animate-in zoom-in-95 duration-200">
          <CardHeader className="text-center pb-2">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-bold">Appointment Confirmed!</CardTitle>
            <CardDescription className="text-sm">
              Your Panchakarma session has been scheduled and added to your patient records.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="p-4 rounded-xl bg-accent/25 border border-border/50 space-y-2.5 text-xs">
              <div className="flex justify-between pb-2 border-b border-border/40">
                <span className="text-muted-foreground">Booking Reference:</span>
                <span className="font-mono font-bold text-primary">{confirmedApt.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Patient:</span>
                <span className="font-semibold text-foreground">{confirmedApt.patientName} ({confirmedApt.patientId})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Therapy:</span>
                <span className="font-semibold text-foreground">{confirmedApt.therapy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Attending Physician:</span>
                <span className="font-semibold text-foreground">{confirmedApt.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Scheduled Date & Time:</span>
                <span className="font-semibold text-foreground">{confirmedApt.date} at {confirmedApt.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
                  CONFIRMED
                </Badge>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-xs text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary shrink-0" />
              <span>This booking is now visible on your patient dashboard and in Dr. {confirmedApt.doctorName.split(" ").slice(-1)}'s clinical queue.</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Link href="/patient/dashboard" className="flex-1">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold h-10">
                  View in Patient Dashboard
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  setIsBooked(false)
                  setConfirmedApt(null)
                  setSelectedDate("")
                  setSelectedTime("")
                  setPatientNotes("")
                }}
                className="flex-1 text-xs h-10"
              >
                Book Another Session
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-accent/20">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/patient/dashboard" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span className="text-xs font-semibold hidden sm:inline">Back to Dashboard</span>
              </Link>
              <div className="flex items-center gap-2 pl-2 sm:border-l border-border/60">
                <Leaf className="h-5 w-5 text-primary" />
                <span className="font-bold text-foreground">VedPulse</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/40 border border-border/50 text-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <span className="font-medium">{user?.name}</span>
                <span className="font-mono text-muted-foreground">({user?.id})</span>
              </div>
              <Badge variant="secondary" className="bg-primary/15 text-primary border border-primary/20 text-xs font-semibold">
                Book Session
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="text-center mb-8">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-2">Authenticated Patient Booking</Badge>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Schedule Your Panchakarma Therapy</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1 max-w-xl mx-auto">
            Booking for <strong className="text-foreground">{user?.name}</strong>. Select your prescribed therapy, preferred Ayurvedic Vaidya, date, and time slot.
          </p>
        </div>

        {bookingError && (
          <div className="mb-6 p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-start gap-2.5 animate-in fade-in max-w-2xl mx-auto">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{bookingError}</div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Booking Form: Therapy & Doctor */}
          <div className="space-y-6">
            {/* Select Therapy */}
            <Card className="border-border/60 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-card-foreground">1. Select Panchakarma Therapy</CardTitle>
                <CardDescription className="text-xs">Choose the bio-cleansing or restorative procedure</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5">
                  {therapies.map((therapy) => (
                    <div
                      key={therapy.id}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedTherapy === therapy.name
                          ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40"
                          : "border-border/60 hover:border-primary/50 bg-card"
                      }`}
                      onClick={() => {
                        setSelectedTherapy(therapy.name)
                        setBookingError(null)
                      }}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="font-semibold text-sm text-card-foreground">{therapy.name}</h3>
                          <p className="text-xs text-muted-foreground">{therapy.description}</p>
                        </div>
                        <Badge variant="secondary" className="bg-accent/60 text-accent-foreground text-[10px] shrink-0">
                          {therapy.duration}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Select Doctor */}
            <Card className="border-border/60 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-card-foreground">2. Select Supervising Vaidya</CardTitle>
                <CardDescription className="text-xs">Choose your certified Ayurvedic doctor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5">
                  {doctorsList.map((doc) => (
                    <div
                      key={doc.id}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedDoctorId === doc.id
                          ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40"
                          : "border-border/60 hover:border-primary/50 bg-card"
                      }`}
                      onClick={() => {
                        setSelectedDoctorId(doc.id)
                        setBookingError(null)
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
                          <Stethoscope className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm text-card-foreground">{doc.name}</h3>
                            <span className="font-mono text-[10px] text-muted-foreground">{doc.id}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {doc.specialization} • {doc.experience}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Date, Time Slot, Notes & Summary */}
          <div className="space-y-6">
            {/* Select Date */}
            <Card className="border-border/60 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-card-foreground text-base">
                  <Calendar className="h-4 w-4 text-primary" />
                  3. Select Session Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value)
                    setBookingError(null)
                  }}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full text-xs"
                />
              </CardContent>
            </Card>

            {/* Select Time Slot */}
            <Card className="border-border/60 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-card-foreground text-base">
                  <Clock className="h-4 w-4 text-primary" />
                  4. Select Time Slot
                </CardTitle>
                <CardDescription className="text-xs">
                  {selectedDate ? "Real-time doctor room availability" : "Choose a date to check availability"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {defaultTimeSlots.map((time) => {
                    const slotInfo = slotAvailability[time]
                    const isAvailable = slotInfo ? slotInfo.available > 0 : true
                    const slotsLeft = slotInfo ? slotInfo.available : 5

                    return (
                      <div
                        key={time}
                        className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                          !isAvailable
                            ? "border-destructive/30 bg-destructive/5 opacity-50 cursor-not-allowed"
                            : selectedTime === time
                              ? "border-primary bg-primary/10 shadow-xs font-semibold ring-1 ring-primary/40"
                              : "border-border/60 hover:border-primary/50 bg-card"
                        }`}
                        onClick={() => {
                          if (isAvailable) {
                            setSelectedTime(time)
                            setBookingError(null)
                          }
                        }}
                      >
                        <div className="text-center">
                          <p className={`text-xs font-semibold ${!isAvailable ? "text-destructive" : "text-foreground"}`}>
                            {time}
                          </p>
                          <div className="flex items-center justify-center gap-1 mt-0.5">
                            {isAvailable ? (
                              <>
                                <CheckCircle className="h-2.5 w-2.5 text-primary" />
                                <span className="text-[10px] text-muted-foreground">{slotsLeft} slots left</span>
                              </>
                            ) : (
                              <span className="text-[10px] text-destructive font-medium">Full</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Optional Notes & Booking Summary */}
            <Card className="border-border/60 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-card-foreground text-base">5. Intake Notes & Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Specific symptoms or medical remarks (optional):</label>
                  <Input
                    type="text"
                    placeholder="e.g. Lower back stiffness, seasonal migraine..."
                    value={patientNotes}
                    onChange={(e) => setPatientNotes(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-2 text-xs p-3.5 rounded-xl bg-accent/20 border border-border/40">
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Patient:</span>
                    <span className="font-semibold text-foreground">{user?.name} ({user?.id})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Therapy:</span>
                    <span className="font-semibold text-foreground">{selectedTherapy || "Not selected"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Doctor:</span>
                    <span className="font-semibold text-foreground">{selectedDoctorObj?.name || "Not selected"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Date & Slot:</span>
                    <span className="font-semibold text-foreground">
                      {selectedDate && selectedTime ? `${selectedDate} at ${selectedTime}` : "Select date & time"}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 text-xs"
                  onClick={handleBookAppointment}
                  disabled={isSubmitting || !selectedDate || !selectedTime || !selectedTherapy || !selectedDoctorObj}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Reserving Appointment...
                    </>
                  ) : (
                    "Confirm & Reserve Appointment"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
