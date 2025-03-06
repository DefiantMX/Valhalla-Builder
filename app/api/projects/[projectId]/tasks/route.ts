import { NextResponse } from "next/server"

// This is a mock task database. In a real application, you'd use a proper database.
const tasks: any[] = []

export async function GET(request: Request, { params }: { params: { projectId: string } }) {
  const projectTasks = tasks.filter((task) => task.projectId === Number.parseInt(params.projectId))
  return NextResponse.json(projectTasks)
}

export async function POST(request: Request, { params }: { params: { projectId: string } }) {
  const { title, startDate, endDate, status } = await request.json()
  const newTask = {
    id: tasks.length + 1,
    projectId: Number.parseInt(params.projectId),
    title,
    startDate,
    endDate,
    status,
  }
  tasks.push(newTask)
  return NextResponse.json(newTask, { status: 201 })
}

