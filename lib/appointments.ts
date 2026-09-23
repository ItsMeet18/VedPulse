// Appointment Management & Persistent Repository for VedPulse

import { User } from "@/lib/auth"

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled"

export interface Appointment {
  id: string
  patientId: string
  patientName: string
  patientEmail: string
  patientPhone?: string
  doctorId: string
  doctorName: string
  doctorSpecialization?: string
  therapy: string
  therapyDuration?: string
  date: string // Format: YYYY-MM-DD
  time: string // e.g. "10:00 AM"
  status: AppointmentStatus
  notes?: string
  isDemo?: boolean // True for pre-seeded demo accounts only
  createdAt: string
  updatedAt?: string
}

export interface CreateAppointmentInput {
  doctorId: string
  doctorName: string
  doctorSpecialization?: string
  therapy: string
  therapyDuration?: string
  date: string
  time: string
  notes?: string
}

const STORAGE_APPOINTMENTS_KEY = "vedpulse_appointments_db"

// Demo appointments seeded EXCLUSIVELY for demo accounts
const SEED_DEMO_APPOINTMENTS: Appointment[] = [
  // Demo Patient John Doe (PAT123456) with Demo Doctors
  {
    id: "APT-1001",
    patientId: "PAT123456",
    patientName: "John Doe",
    patientEmail: "patient@vedpulse.com",
    patientPhone: "+91 9876543210",
    doctorId: "DOC001",
    doctorName: "Dr. Rajesh Sharma",
    doctorSpecialization: "Chief Panchakarma Specialist",
    therapy: "Abhyanga (Warm Oil Massage)",
    therapyDuration: "60 min",
    date: "2026-09-25",
    time: "10:00 AM",
    status: "confirmed",
    notes: "Vata pacification treatment. Recommended warm water and light diet beforehand.",
    isDemo: true,
    createdAt: "2026-09-20T10:00:00.000Z",
  },
  {
    id: "APT-1002",
    patientId: "PAT123456",
    patientName: "John Doe",
    patientEmail: "patient@vedpulse.com",
    patientPhone: "+91 9876543210",
    doctorId: "DOC002",
    doctorName: "Dr. Priya Patel",
    doctorSpecialization: "Ayurvedic Physician & Nutritionist",
    therapy: "Shirodhara (Nervous Care)",
    therapyDuration: "45 min",
    date: "2026-09-28",
    time: "2:00 PM",
    status: "pending",
    notes: "Stress & insomnia relief session. Follow with herbal infusion.",
    isDemo: true,
    createdAt: "2026-09-21T14:30:00.000Z",
  },
  {
    id: "APT-1003",
    patientId: "PAT123456",
    patientName: "John Doe",
    patientEmail: "patient@vedpulse.com",
    patientPhone: "+91 9876543210",
    doctorId: "DOC001",
    doctorName: "Dr. Rajesh Sharma",
    doctorSpecialization: "Chief Panchakarma Specialist",
    therapy: "Swedana (Herbal Steam)",
    therapyDuration: "30 min",
    date: "2026-09-18",
    time: "11:00 AM",
    status: "completed",
    notes: "Post-abhyanga detoxification steam therapy completed successfully.",
    isDemo: true,
    createdAt: "2026-09-15T09:00:00.000Z",
  },
  // Demo Patient Sarah Johnson with Dr. Priya Patel
  {
    id: "APT-1004",
    patientId: "PAT123457",
    patientName: "Sarah Johnson",
    patientEmail: "sarah.j@email.com",
    patientPhone: "+91 9876543211",
    doctorId: "DOC002",
    doctorName: "Dr. Priya Patel",
    doctorSpecialization: "Ayurvedic Physician & Nutritionist",
    therapy: "Shirodhara (Nervous Care)",
    therapyDuration: "45 min",
    date: "2026-09-24",
    time: "10:30 AM",
    status: "confirmed",
    notes: "Weekly mental calming therapy and diet assessment.",
    isDemo: true,
    createdAt: "2026-09-19T11:00:00.000Z",
  },
  // Demo Patient Amit Patel with Dr. Amit Singh
  {
    id: "APT-1005",
    patientId: "PAT123458",
    patientName: "Amit Patel",
    patientEmail: "amit.patel@email.com",
    patientPhone: "+91 9876543212",
    doctorId: "DOC003",
    doctorName: "Dr. Amit Singh",
    doctorSpecialization: "Detox & Rejuvenation Specialist",
    therapy: "Basti Karma",
    therapyDuration: "90 min",
    date: "2026-09-24",
    time: "2:00 PM",
    status: "confirmed",
    notes: "Lower back joint stiffness and Vata cleansing protocol.",
    isDemo: true,
    createdAt: "2026-09-19T12:00:00.000Z",
  },
]

export async function initializeAppointmentStore(): Promise<Appointment[]> {
  if (typeof window === "undefined") return SEED_DEMO_APPOINTMENTS

  try {
    const raw = localStorage.getItem(STORAGE_APPOINTMENTS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Appointment[]
      if (Array.isArray(parsed)) {
        // Ensure no demo appointments are attached to real accounts (e.g. meetshah.180106@gmail.com)
        const sanitized = parsed.filter(
          (apt) =>
            !(
              apt.patientEmail?.toLowerCase() === "meetshah.180106@gmail.com" &&
              apt.isDemo === true
            )
        )

        // Ensure baseline demo appointments exist for demo testing
        for (const demoApt of SEED_DEMO_APPOINTMENTS) {
          if (!sanitized.some((a) => a.id === demoApt.id)) {
            sanitized.push(demoApt)
          }
        }

        if (sanitized.length !== parsed.length) {
          localStorage.setItem(STORAGE_APPOINTMENTS_KEY, JSON.stringify(sanitized))
        }
        return sanitized
      }
    }
  } catch (e) {
    console.error("Failed to read appointments from localStorage", e)
  }

  // Seed default demo appointments
  try {
    localStorage.setItem(STORAGE_APPOINTMENTS_KEY, JSON.stringify(SEED_DEMO_APPOINTMENTS))
  } catch (e) {
    console.error("Failed to save seed appointments", e)
  }

  return SEED_DEMO_APPOINTMENTS
}

export async function getAllAppointments(): Promise<Appointment[]> {
  return initializeAppointmentStore()
}

export async function saveAppointments(appointments: Appointment[]): Promise<void> {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_APPOINTMENTS_KEY, JSON.stringify(appointments))
}

// Role-based filtering:
// Patients see ONLY their appointments
// Doctors see ONLY appointments assigned to their account
export async function getAppointmentsForUser(user: User): Promise<Appointment[]> {
  const all = await getAllAppointments()

  if (user.role === "patient") {
    // If real customer account, filter by patient ID or email, and exclude unassociated demo records
    return all.filter(
      (a) =>
        a.patientId === user.id ||
        a.patientEmail.toLowerCase() === user.email.toLowerCase()
    )
  }

  if (user.role === "doctor") {
    // Return appointments assigned to this doctor
    return all.filter(
      (a) =>
        a.doctorId === user.id ||
        (user.id === "DOC001" && (a.doctorId === "DOC001" || a.doctorName.includes("Sharma"))) ||
        (user.id === "DOC002" && (a.doctorId === "DOC002" || a.doctorName.includes("Patel"))) ||
        (user.id === "DOC003" && (a.doctorId === "DOC003" || a.doctorName.includes("Singh")))
    )
  }

  return []
}

// Check real slot capacity (Max 5 patients per slot)
export async function checkSlotAvailability(
  doctorId: string,
  date: string,
  time: string
): Promise<{ available: number; total: number }> {
  const all = await getAllAppointments()
  const bookedCount = all.filter(
    (a) =>
      a.doctorId === doctorId &&
      a.date === date &&
      a.time === time &&
      a.status !== "cancelled"
  ).length

  const total = 5
  const available = Math.max(0, total - bookedCount)
  return { available, total }
}

// Book a new appointment
export async function createAppointment(
  input: CreateAppointmentInput,
  user: User
): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
  if (user.role !== "patient") {
    return { success: false, error: "Only registered patients can book appointments." }
  }

  const { doctorId, doctorName, doctorSpecialization, therapy, therapyDuration, date, time, notes } = input

  if (!doctorId || !doctorName) {
    return { success: false, error: "Please select an attending Ayurvedic doctor." }
  }

  if (!therapy) {
    return { success: false, error: "Please select a Panchakarma therapy." }
  }

  if (!date) {
    return { success: false, error: "Please choose an appointment date." }
  }

  const selectedDateObj = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (selectedDateObj < today) {
    return { success: false, error: "Cannot book an appointment for a past date." }
  }

  if (!time) {
    return { success: false, error: "Please select a time slot." }
  }

  const all = await getAllAppointments()

  // Prevent duplicate booking for the same patient at the exact same date & time
  const existingPatientBooking = all.find(
    (a) =>
      (a.patientId === user.id || a.patientEmail.toLowerCase() === user.email.toLowerCase()) &&
      a.date === date &&
      a.time === time &&
      a.status !== "cancelled"
  )

  if (existingPatientBooking) {
    return {
      success: false,
      error: `You already have a scheduled appointment (${existingPatientBooking.therapy}) on ${date} at ${time}.`,
    }
  }

  // Check capacity for this doctor slot
  const slotCheck = await checkSlotAvailability(doctorId, date, time)
  if (slotCheck.available <= 0) {
    return {
      success: false,
      error: "This time slot is fully booked for the selected doctor. Please choose a different slot.",
    }
  }

  // Generate unique Appointment ID
  let newAptId: string
  do {
    newAptId = `APT-${Math.floor(10000 + Math.random() * 90000)}`
  } while (all.some((a) => a.id === newAptId))

  const newAppointment: Appointment = {
    id: newAptId,
    patientId: user.id,
    patientName: user.name,
    patientEmail: user.email,
    patientPhone: user.phone,
    doctorId,
    doctorName,
    doctorSpecialization,
    therapy,
    therapyDuration: therapyDuration || "60 min",
    date,
    time,
    status: "confirmed", // Automatically confirmed upon booking
    notes: notes?.trim() || "Standard intake consultation and Panchakarma treatment.",
    isDemo: false, // Genuine real customer booking
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  all.unshift(newAppointment)
  await saveAppointments(all)

  return { success: true, appointment: newAppointment }
}

// Update appointment status (Doctors can confirm/complete/cancel; Patients can cancel their own)
export async function updateAppointmentStatus(
  appointmentId: string,
  newStatus: AppointmentStatus,
  user: User,
  notes?: string
): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
  const all = await getAllAppointments()
  const idx = all.findIndex((a) => a.id === appointmentId)

  if (idx === -1) {
    return { success: false, error: "Appointment not found." }
  }

  const target = all[idx]

  // Role Authorization Check
  if (user.role === "patient") {
    // Patients can only cancel their own appointments
    if (target.patientId !== user.id && target.patientEmail.toLowerCase() !== user.email.toLowerCase()) {
      return { success: false, error: "Unauthorized. You can only modify your own appointments." }
    }
    if (newStatus !== "cancelled") {
      return { success: false, error: "Patients can only cancel appointments." }
    }
  } else if (user.role === "doctor") {
    // Doctors can only modify appointments assigned to them
    const isAssignedDoctor =
      target.doctorId === user.id ||
      (user.id === "DOC001" && (target.doctorId === "DOC001" || target.doctorName.includes("Sharma"))) ||
      (user.id === "DOC002" && (target.doctorId === "DOC002" || target.doctorName.includes("Patel"))) ||
      (user.id === "DOC003" && (target.doctorId === "DOC003" || target.doctorName.includes("Singh")))

    if (!isAssignedDoctor) {
      return { success: false, error: "Unauthorized. You cannot modify appointments assigned to another doctor." }
    }
  }

  target.status = newStatus
  target.updatedAt = new Date().toISOString()
  if (notes) {
    target.notes = notes
  }

  all[idx] = target
  await saveAppointments(all)

  return { success: true, appointment: target }
}

// Cancel appointment
export async function cancelAppointment(
  appointmentId: string,
  user: User
): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
  return updateAppointmentStatus(appointmentId, "cancelled", user, "Cancelled by user")
}
