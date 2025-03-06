import { NextResponse } from "next/server"
import { unlink } from "fs/promises"
import path from "path"

// This is a mock plan database. In a real application, you'd use a proper database.
const plans: any[] = []

export async function DELETE(request: Request, { params }: { params: { id: string; planId: string } }) {
  try {
    const planIndex = plans.findIndex((plan) => plan.projectId === params.id && plan.id === Number(params.planId))

    if (planIndex === -1) {
      return NextResponse.json({ message: "Plan not found" }, { status: 404 })
    }

    const plan = plans[planIndex]

    // Extract the file path from the URL
    const relativePath = plan.url
    const filePath = path.join(process.cwd(), "public", relativePath)

    try {
      await unlink(filePath)
    } catch (error) {
      console.error("Error deleting file:", error)
      // Continue with plan deletion even if file deletion fails
    }

    plans.splice(planIndex, 1)

    return NextResponse.json({ message: "Plan deleted successfully" })
  } catch (error) {
    console.error("Error deleting plan:", error)
    return NextResponse.json({ message: "An error occurred while deleting the plan" }, { status: 500 })
  }
}

