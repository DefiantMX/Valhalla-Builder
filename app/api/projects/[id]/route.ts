import { NextResponse } from "next/server"
import { projectStore } from "@/lib/store"

// This is a mock project database. In a real application, you'd use a proper database.
const staticProjects = [
  {
    id: 1,
    name: "Downtown Office Complex",
    description: "A modern office complex in the heart of downtown",
    status: "In Progress",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
  },
  {
    id: 2,
    name: "Riverside Apartments",
    description: "Luxury apartment complex with riverside views",
    status: "Planning",
    startDate: "2024-03-01",
    endDate: "2025-06-30",
  },
  {
    id: 3,
    name: "Tech Innovation Center",
    description: "State-of-the-art technology innovation hub",
    status: "In Progress",
    startDate: "2024-02-15",
    endDate: "2024-11-30",
  },
]

// Use a simple array instead of global variable for this mock implementation
const dynamicProjects: any[] = []

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const projectId = Number.parseInt(params.id)
    const project = projectStore.getProject(projectId)

    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error("Error fetching project:", error)
    return NextResponse.json({ message: "An error occurred while fetching the project" }, { status: 500 })
  }
}

