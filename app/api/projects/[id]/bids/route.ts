import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

// This is a mock database. In a real application, you'd use a proper database.
const bids: any[] = []

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const projectBids = bids.filter((bid) => bid.projectId === params.id)
  return NextResponse.json(projectBids)
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const formData = await request.formData()
    const contractor = formData.get("contractor") as string
    const amount = Number(formData.get("amount"))
    const division = formData.get("division") as string
    const description = formData.get("description") as string
    const document = formData.get("document") as File | null

    if (!contractor || !amount || !division) {
      return NextResponse.json({ message: "Contractor, amount, and division are required" }, { status: 400 })
    }

    let documentUrl = null
    if (document) {
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "bids")
      await mkdir(uploadsDir, { recursive: true })

      // Generate unique filename
      const timestamp = Date.now()
      const filename = `${timestamp}_${document.name}`
      const filePath = path.join(uploadsDir, filename)

      // Save the file
      const bytes = await document.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      documentUrl = `/uploads/bids/${filename}`
    }

    const newBid = {
      id: bids.length + 1,
      projectId: params.id,
      contractor,
      amount,
      division,
      description,
      documentUrl,
      submissionDate: new Date().toISOString(),
    }

    bids.push(newBid)
    return NextResponse.json(newBid, { status: 201 })
  } catch (error) {
    console.error("Error processing bid:", error)
    return NextResponse.json({ message: "Error processing bid" }, { status: 500 })
  }
}

