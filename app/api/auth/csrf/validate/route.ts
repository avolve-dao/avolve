import { validateCsrfToken } from "@/lib/csrf-server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Missing CSRF token" }, { status: 400 })
    }

    const isValid = await validateCsrfToken(token)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error validating CSRF token:", error)
    return NextResponse.json({ error: "Failed to validate security token" }, { status: 500 })
  }
}
