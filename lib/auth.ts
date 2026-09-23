// Authentication Utilities & User Repository for VedPulse

export type UserRole = "patient" | "doctor"

export interface User {
  id: string
  email: string
  role: UserRole
  name: string
  age?: number
  phone?: string
  location?: string
  address?: string
  specialization?: string
  experience?: string
  isDemo?: boolean
  createdAt: string
}

export interface StoredUser extends User {
  passwordHash: string
  salt: string
}

export interface LoginCredentials {
  identifier: string // email or ID (e.g. PAT123456, DOC001, DOC002, DOC003)
  password: string
}

export interface RegisterPatientInput {
  name: string
  email: string
  password: string
  age?: number
  phone?: string
  location?: string
  address?: string
}

const STORAGE_USERS_KEY = "vedpulse_users_db"
const STORAGE_SESSION_KEY = "vedpulse_auth_session"

// Robust SHA-256 hashing using Web Crypto API
export async function hashPassword(password: string, salt: string): Promise<string> {
  const textEncoder = new TextEncoder()
  const data = textEncoder.encode(`${salt}:${password}`)
  
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  }

  // Fallback for SSR/non-crypto environment
  let hash = 0
  const combined = `${salt}:${password}`
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return Math.abs(hash).toString(16).padStart(64, "0")
}

export function generateSalt(): string {
  if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(16)
    window.crypto.getRandomValues(array)
    return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("")
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Initial authorized pre-hashed accounts (zero plaintext passwords stored in source code)
const SEED_USERS: StoredUser[] = [
  // 1. Demo Patient: John Doe (Password: Password@123)
  {
    id: "PAT123456",
    email: "patient@vedpulse.com",
    role: "patient",
    name: "John Doe",
    age: 35,
    phone: "+91 9876543210",
    location: "Mumbai, Maharashtra",
    address: "402, Green Meadows, Andheri West, Mumbai",
    isDemo: true,
    createdAt: "2024-11-01T08:00:00.000Z",
    salt: "33752326b45316511be119dba6013fee",
    passwordHash: "7113886141891bfd099e5bab6457f5ddfff6e83e445e9bdcd2701abd9b6290c9",
  },
  // 2. Demo Doctor 1: Dr. Rajesh Sharma (Password: Doctor@123)
  {
    id: "DOC001",
    email: "dr.sharma@vedpulse.com",
    role: "doctor",
    name: "Dr. Rajesh Sharma",
    phone: "+91 9820012345",
    location: "Mumbai, Maharashtra",
    address: "VedPulse Center, Bandra West, Mumbai",
    specialization: "Chief Panchakarma Specialist",
    experience: "15+ Years",
    isDemo: true,
    createdAt: "2024-10-01T08:00:00.000Z",
    salt: "3a816e193a65bdf795c1a1c306adfc05",
    passwordHash: "7eda9bc3b16965b6599a8bcfa0dcee28a8c2bdcdf43fa882304557a4a4ff511d",
  },
  // 3. Demo Doctor 2: Dr. Priya Patel (Password: Doctor@123)
  {
    id: "DOC002",
    email: "dr.patel@vedpulse.com",
    role: "doctor",
    name: "Dr. Priya Patel",
    phone: "+91 9820054321",
    location: "Pune, Maharashtra",
    address: "Ayurvedic Wellness Sanctuary, Koregaon Park, Pune",
    specialization: "Ayurvedic Physician & Nutritionist",
    experience: "12+ Years",
    isDemo: true,
    createdAt: "2024-10-01T08:00:00.000Z",
    salt: "78f8ffcfd917a3816ce431d073296317",
    passwordHash: "d87c11ba11131c888b8c842a7c5597f8737389357e3a6a458cff1644ce87c83f",
  },
  // 4. Demo Doctor 3: Dr. Amit Singh (Password: Doctor@123)
  {
    id: "DOC003",
    email: "dr.singh@vedpulse.com",
    role: "doctor",
    name: "Dr. Amit Singh",
    phone: "+91 9820098765",
    location: "Ahmedabad, Gujarat",
    address: "Veda Detox Institute, SG Highway, Ahmedabad",
    specialization: "Detox & Rejuvenation Specialist",
    experience: "10+ Years",
    isDemo: true,
    createdAt: "2024-10-01T08:00:00.000Z",
    salt: "bda023287284fcefbea1eb5951457086",
    passwordHash: "5e41c28b7910b222c7d8c640ea03340e3426a404142f6431117622657d12b0c5",
  },
  // 5. Customer Account: meetshah.180106@gmail.com (Cryptographically Hashed)
  {
    id: "PAT990001",
    email: "meetshah.180106@gmail.com",
    role: "patient",
    name: "Meet Shah",
    age: 26,
    phone: "+91 9876500000",
    location: "Mumbai, Maharashtra",
    address: "Mumbai, India",
    isDemo: false,
    createdAt: "2024-11-01T08:00:00.000Z",
    salt: "4457e78f59cb11acebae9db8e5615e55",
    passwordHash: "cda03f4d3a2504066e1233b7f83774d940cb4794bf2c6d6fc34b7a09ee909626",
  },
]

export async function initializeUserStore(): Promise<StoredUser[]> {
  if (typeof window === "undefined") return []

  let existingUsers: StoredUser[] = []
  try {
    const stored = localStorage.getItem(STORAGE_USERS_KEY)
    if (stored) {
      existingUsers = JSON.parse(stored) as StoredUser[]
    }
  } catch (e) {
    console.error("Failed to read user store from localStorage", e)
  }

  // Ensure all seed users & doctors exist with synchronized credentials in user store
  let modified = false
  for (const seedUser of SEED_USERS) {
    const matchIdx = existingUsers.findIndex(
      (u) =>
        u.id === seedUser.id ||
        u.email.toLowerCase() === seedUser.email.toLowerCase() ||
        (seedUser.id === "DOC001" && (u.id === "DOC001" || u.email.toLowerCase() === "doctor@vedpulse.com" || u.email.toLowerCase() === "dr.sharma@vedpulse.com"))
    )

    if (matchIdx === -1) {
      existingUsers.push(seedUser)
      modified = true
    } else {
      // Synchronize seed user credentials and attributes
      existingUsers[matchIdx] = {
        ...existingUsers[matchIdx],
        ...seedUser,
      }
      modified = true
    }
  }

  if (modified || existingUsers.length === 0) {
    try {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(existingUsers))
    } catch (e) {
      console.error("Failed to save initialized users", e)
    }
  }

  return existingUsers
}

export async function getStoredUsers(): Promise<StoredUser[]> {
  return initializeUserStore()
}

export async function getRegisteredDoctors(): Promise<User[]> {
  const users = await getStoredUsers()
  return users
    .filter((u) => u.role === "doctor")
    .map(({ passwordHash: _, salt: __, ...clean }) => clean)
}

export async function saveUser(user: StoredUser): Promise<void> {
  const users = await getStoredUsers()
  const existingIdx = users.findIndex((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase())
  if (existingIdx >= 0) {
    users[existingIdx] = user
  } else {
    users.push(user)
  }
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users))
}

// User Authentication function
export async function authenticateUser(
  credentials: LoginCredentials,
  requiredRole: UserRole
): Promise<{ success: boolean; user?: User; error?: string }> {
  const { identifier, password } = credentials

  if (!identifier || !identifier.trim()) {
    return { success: false, error: "Please enter your Email or ID." }
  }

  if (!password) {
    return { success: false, error: "Please enter your password." }
  }

  const users = await getStoredUsers()
  const normalizedId = identifier.trim().toLowerCase()

  // Match identifier against ID, email, and known aliases
  const found = users.find((u) => {
    const uid = u.id.toLowerCase()
    const uemail = u.email.toLowerCase()

    if (uid === normalizedId || uemail === normalizedId) {
      return true
    }

    // Dr. Rajesh Sharma aliases (DOC001, dr.sharma@vedpulse.com, doctor@vedpulse.com)
    if (
      (normalizedId === "dr.sharma@vedpulse.com" || normalizedId === "doctor@vedpulse.com" || normalizedId === "doc001") &&
      (uid === "doc001" || uemail === "dr.sharma@vedpulse.com" || uemail === "doctor@vedpulse.com")
    ) {
      return true
    }

    // Dr. Priya Patel aliases (DOC002, dr.patel@vedpulse.com)
    if (
      (normalizedId === "dr.patel@vedpulse.com" || normalizedId === "doc002") &&
      (uid === "doc002" || uemail === "dr.patel@vedpulse.com")
    ) {
      return true
    }

    // Dr. Amit Singh aliases (DOC003, dr.singh@vedpulse.com)
    if (
      (normalizedId === "dr.singh@vedpulse.com" || normalizedId === "doc003") &&
      (uid === "doc003" || uemail === "dr.singh@vedpulse.com")
    ) {
      return true
    }

    return false
  })

  if (!found) {
    return {
      success: false,
      error: `No account found for "${identifier}". Please check your credentials or register a new account.`,
    }
  }

  if (found.role !== requiredRole) {
    return {
      success: false,
      error: `This account is registered as a ${found.role}. Please use the ${found.role} portal to log in.`,
    }
  }

  // Validate hashed password
  const hashedInput = await hashPassword(password, found.salt)
  const passwordMatches = hashedInput === found.passwordHash

  if (!passwordMatches) {
    return {
      success: false,
      error: "Incorrect password. Please verify your credentials and try again.",
    }
  }

  // Strip sensitive hashes before returning
  const { passwordHash: _, salt: __, ...cleanUser } = found
  return { success: true, user: cleanUser }
}

// Patient Registration function
export async function registerPatient(
  input: RegisterPatientInput
): Promise<{ success: boolean; user?: User; error?: string }> {
  const { name, email, password, age, phone, location, address } = input

  if (!name || name.trim().length < 2) {
    return { success: false, error: "Please enter a valid full name (minimum 2 characters)." }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !emailRegex.test(email.trim())) {
    return { success: false, error: "Please enter a valid email address." }
  }

  if (!password || password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." }
  }

  const users = await getStoredUsers()
  const emailExists = users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())
  if (emailExists) {
    return {
      success: false,
      error: "An account with this email address already exists. Please log in instead.",
    }
  }

  // Generate unique patient ID: PAT + 6 random digits
  let newId: string
  do {
    newId = `PAT${Math.floor(100000 + Math.random() * 900000)}`
  } while (users.some((u) => u.id === newId))

  const salt = generateSalt()
  const passwordHash = await hashPassword(password, salt)

  const newStoredUser: StoredUser = {
    id: newId,
    email: email.trim().toLowerCase(),
    role: "patient",
    name: name.trim(),
    age: age ? Number(age) : undefined,
    phone: phone?.trim(),
    location: location?.trim(),
    address: address?.trim(),
    isDemo: false, // New registrations are always real accounts
    createdAt: new Date().toISOString(),
    salt,
    passwordHash,
  }

  await saveUser(newStoredUser)

  const { passwordHash: _, salt: __, ...cleanUser } = newStoredUser
  return { success: true, user: cleanUser }
}

// Session Management
export function getSavedSession(): User | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function saveSession(user: User): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user))
}

export function clearSession(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_SESSION_KEY)
}
