import { NextResponse } from "next/server"

// This is a mock task database. In a real application, you'd use a proper database.
const tasks: any[] = []

export async function DELETE(request: Request, { params }: { params: { projectId: string; taskId: string } }) {
  const taskIndex = tasks.findIndex(
    (task) => task.projectId === Number.parseInt(params.projectId) && task.id === Number.parseInt(params.taskId),
  )

  if (taskIndex === -1) {
    return NextResponse.json({ message: "Task not found" }, { status: 404 })
  }

  tasks.splice(taskIndex, 1)
  return NextResponse.json({ message: "Task deleted successfully" })
}

