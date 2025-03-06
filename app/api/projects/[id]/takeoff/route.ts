import { NextResponse } from "next/server"

// This is a mock database. In a real application, you'd use a proper database.
const measurements: any[] = []

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const projectMeasurements = measurements.filter((m) => m.projectId === params.id)
  return NextResponse.json(projectMeasurements)
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const measurement = await request.json()

  const newMeasurement = {
    id: measurements.length + 1,
    projectId: params.id,
    ...measurement,
  }

  measurements.push(newMeasurement)
  return NextResponse.json(newMeasurement, { status: 201 })
}

