import { generateCsrfToken } from "@/lib/csrf-server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const token = await generateCsrfToken()

    return NextResponse.json({ token })
  } catch (error) {
    console.error("Error generating CSRF token:", error)
    return NextResponse.json({ error: "Failed to generate security token" }, { status: 500 })
  }
}
