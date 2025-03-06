import { NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"

// This is a mock plan database. In a real application, you'd use a proper database.
const plans: any[] = []

export async function GET(request: Request, { params }: { params: { projectId: string } }) {
  const projectPlans = plans.filter((plan) => plan.projectId === Number.parseInt(params.projectId))
  return NextResponse.json(projectPlans)
}

export async function POST(request: Request, { params }: { params: { projectId: string } }) {
  const data = await request.formData()
  const file: File | null = data.get("file") as unknown as File

  if (!file) {
    return NextResponse.json({ message: "No file uploaded" }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // This is a mock file path. In a real application, you'd use a proper file storage system.
  const filePath = path.join(process.cwd(), "public", "uploads", file.name)
  await writeFile(filePath, buffer)

  const newPlan = {
    id: plans.length + 1,
    projectId: Number.parseInt(params.projectId),
    name: file.name,
    url: `/uploads/${file.name}`,
    uploadedAt: new Date().toISOString(),
  }

  plans.push(newPlan)

  return NextResponse.json(newPlan, { status: 201 })
}

