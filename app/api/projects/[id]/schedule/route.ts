import { NextResponse } from "next/server"

// This is a mock schedule database. In a real application, you'd use a proper database.
const scheduleItems = [
  {
    id: 1,
    projectId: "1",
    title: "Foundation Work",
    startDate: "2023-06-01",
    endDate: "2023-06-15",
    assignee: "John Doe",
    status: "Completed",
  },
  {
    id: 2,
    projectId: "1",
    title: "Framing",
    startDate: "2023-06-16",
    endDate: "2023-07-15",
    assignee: "Jane Smith",
    status: "In Progress",
  },
  {
    id: 3,
    projectId: "1",
    title: "Electrical Wiring",
    startDate: "2023-07-16",
    endDate: "2023-07-31",
    assignee: "Bob Johnson",
    status: "Not Started",
  },
]

export async function GET(request: Request, { params }: { params: { id: string } }) {
  // Simulate a delay to mimic a real API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  const projectSchedule = scheduleItems.filter((item) => item.projectId === params.id)
  return NextResponse.json(projectSchedule)
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const newTask = await request.json()

  const task = {
    id: scheduleItems.length + 1,
    projectId: params.id,
    ...newTask,
  }

  scheduleItems.push(task)
  return NextResponse.json(task, { status: 201 })
}

