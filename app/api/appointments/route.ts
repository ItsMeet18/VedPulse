import { NextResponse } from "next/server"
import { getAllAppointments, createAppointment } from "@/lib/appointments"

export async function GET() {
  try {
    const appointments = await getAllAppointments()
    return NextResponse.json({ success: true, appointments })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch appointments" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { input, user } = body

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const result = await createAppointment(input, user)
    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create appointment" },
      { status: 500 }
    )
  }
}
