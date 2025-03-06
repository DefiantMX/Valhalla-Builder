import { NextResponse } from "next/server"
import { projectStore } from "@/lib/store"

export async function GET() {
  const allProjects = projectStore.getAllProjects()
  return NextResponse.json(allProjects)
}

export async function POST(request: Request) {
  try {
    const { name, status, description, startDate, endDate } = await request.json()

    if (!name || !status) {
      return NextResponse.json({ message: "Name and status are required" }, { status: 400 })
    }

    const newProject = projectStore.addProject({
      name,
      status,
      description: description || "",
      startDate: startDate || "",
      endDate: endDate || "",
    })

    return NextResponse.json(newProject, { status: 201 })
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json({ message: "An error occurred while creating the project" }, { status: 500 })
  }
}

