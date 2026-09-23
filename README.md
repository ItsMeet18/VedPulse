# 🌿 VedPulse — Panchakarma & Ayurvedic Healthcare Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.2.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**VedPulse** is a modern, comprehensive digital healthcare platform designed to bridge classical Ayurvedic Panchakarma therapy with modern clinical workflows. It offers role-based portals for patients and Ayurvedic practitioners (Vaidyas), real-time appointment scheduling, personalized detox tracking, and an interactive Ayurvedic AI assistant.

## 🌐 Live Demo

🚀 **[Visit VedPulse — Live Website](https://vedpulse.vercel.app/)**

> Explore the deployed application, including the patient portal, doctor dashboard, appointment booking, and Ayurvedic AI assistant.

---

## ✨ Features

### 1. 🏥 Patient Portal
* **Personalized Panchakarma Tracking**: View active therapy stages (Purvakarma, Pradhanakarma, Paschatkarma), daily detox schedules, and dietary recommendations (*Pathya-Apathya*).
* **Self-Service Appointment Booking**: Choose specialized therapies (Shirodhara, Abhyanga, Basti, Virechana, etc.), select preferred doctors, and pick available time slots.
* **Appointment Management**: Live status tracking (*Pending*, *Confirmed*, *Completed*, *Cancelled*) with one-click cancellation.
* **Health Analytics**: Interactive charts visualizing wellness scores, Dosha balance, and session completion metrics.

### 2. 👨‍⚕️ Doctor & Vaidya Portal
* **Dedicated Clinical Dashboard**: Real-time queue showing only appointments assigned to the logged-in doctor.
* **Queue & Status Workflow**: Update session statuses (*Pending* ➔ *Confirmed* ➔ *Completed* or *Cancelled*) with live confirmation prompts.
* **Patient Records & Therapy Notes**: Access patient vitals, medical history, age, contact details, and specific session notes.
* **Schedule & Capacity Oversight**: Track daily patient load, completed sessions, and upcoming consultations.

### 3. 📅 Smart Appointment Engine
* **Slot Capacity Management**: Real-time availability calculation with maximum booking capacity limits per time slot.
* **Authentication Guard**: Directs unauthenticated users through a seamless login/registration redirect flow before booking.
* **Role-Based Isolation**: Strict separation between doctor schedules and patient medical histories.

### 4. 🤖 AyurBot — AI Wellness Chat
* **Dosha & Prakriti Consultation**: Guidance on identifying Vata, Pitta, and Kapha imbalances.
* **Therapy Recommendations**: Suggestions for traditional detox therapies based on user queries.
* **Daily Regimen (*Dinacharya*)**: Lifestyle and herbal routine recommendations aligned with Ayurvedic principles.

---

## 🛠️ Tech Stack

* **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
* **UI & Components**: [React 19](https://react.dev/), [Radix UI](https://www.radix-ui.com/), [Shadcn UI](https://ui.shadcn.com/)
* **Styling**: [Tailwind CSS 4](https://tailwindcss.com/), `tw-animate-css`
* **Icons**: [Lucide React](https://lucide.dev/)
* **Charts & Visualizations**: [Recharts](https://recharts.org/)
* **Security & Auth**: Web Crypto API (SHA-256 password hashing with unique salt generation)
* **Data Layer**: Modular repository pattern with RESTful Next.js API route handlers

---

## 📁 Project Structure

```text
vedpulse/
├── app/
│   ├── api/
│   │   └── appointments/          # REST endpoints for appointment CRUD & status updates
│   │       └── [id]/              # Individual appointment operations
│   ├── appointments/              # Therapy session booking interface
│   ├── chat/                      # AyurBot AI consultation interface
│   ├── doctor/
│   │   └── dashboard/             # Practitioner queue & patient management dashboard
│   ├── patient/
│   │   └── dashboard/             # Patient wellness & therapy tracking dashboard
│   ├── login/                     # Role-based authentication & registration
│   ├── layout.tsx                 # Root application layout & theme provider
│   └── page.tsx                   # Landing page (Therapies, Doshas, Vaidyas, Testimonials)
├── components/
│   ├── ui/                        # Reusable UI primitives (Buttons, Cards, Dialogs, Tabs)
│   ├── navbar.tsx                 # Navigation bar with role-aware portal links
│   └── footer.tsx                 # Application footer
├── lib/
│   ├── appointments.ts            # Appointment data models & business logic
│   ├── auth.ts                    # Authentication repository & SHA-256 hashing
│   ├── auth-context.tsx           # React authentication context provider
│   └── utils.ts                   # Utility functions & class merger
└── public/                        # Static assets, logos, and therapy imagery
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** 18.18.0 or higher
* **npm**, **pnpm**, or **yarn**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/vedpulse.git
   cd vedpulse
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000) to access the application.

---

## 🔑 Demo Credentials

For testing and demonstration, pre-configured demo accounts are available on the [Login Page](http://localhost:3000/login):

### Doctor Accounts (Practitioner Portal)
| Doctor Name | Specialization | Identifier / Email | Password |
| :--- | :--- | :--- | :--- |
| **Dr. Rajesh Sharma** | Chief Panchakarma Specialist | `dr.sharma@vedpulse.com` / `DOC001` | `Doctor@123` |
| **Dr. Priya Patel** | Ayurvedic Physician & Nutritionist | `dr.patel@vedpulse.com` / `DOC002` | `Doctor@123` |
| **Dr. Amit Singh** | Detox & Rejuvenation Specialist | `dr.singh@vedpulse.com` / `DOC003` | `Doctor@123` |

### Patient Accounts (Patient Portal)
| Account Type | Name | Identifier / Email | Password |
| :--- | :--- | :--- | :--- |
| **Demo Patient** | John Doe | `patient@vedpulse.com` / `PAT123456` | `Password@123` |

> 💡 **Tip**: New patients can also register directly via the **Patient Registration** tab to create their own isolated account.

---

## 🌐 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/appointments` | Fetch appointments filtered by user role (`patientId` or `doctorId`) |
| `POST` | `/api/appointments` | Create a new appointment booking |
| `PATCH` | `/api/appointments/:id` | Update appointment status (`pending`, `confirmed`, `completed`, `cancelled`) |
| `DELETE` | `/api/appointments/:id` | Cancel/remove an appointment record |

---

## 🔒 Security & Privacy

* **Password Protection**: Passwords are cryptographically hashed using SHA-256 with randomly generated salt strings.
* **Data Isolation**: Patients can only view and manage their own medical bookings; doctors have access strictly to their assigned patient queues.
* **Authentication Guarding**: Protected routes redirect unauthenticated users to the portal login before granting access to sensitive clinical dashboards.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
