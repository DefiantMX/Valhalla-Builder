import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { PDFDocument } from "pdf-lib"

// This is a mock plan database. In a real application, you'd use a proper database.
const plans: any[] = []

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const projectPlans = plans.filter((plan) => plan.projectId === params.id)
  return NextResponse.json(projectPlans)
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.formData()
    const file: File | null = data.get("file") as unknown as File

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create the uploads directory structure if it doesn't exist
    const publicDir = path.join(process.cwd(), "public")
    const uploadsDir = path.join(publicDir, "uploads")
    const projectUploadsDir = path.join(uploadsDir, params.id)

    try {
      // Create directories recursively
      await mkdir(publicDir, { recursive: true })
      await mkdir(uploadsDir, { recursive: true })
      await mkdir(projectUploadsDir, { recursive: true })
    } catch (error) {
      console.error("Error creating directories:", error)
      return NextResponse.json({ message: "Error creating upload directories" }, { status: 500 })
    }

    // Generate a unique filename to avoid collisions
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const fileName = `${timestamp}_${safeName}`
    const filePath = path.join(projectUploadsDir, fileName)

    try {
      await writeFile(filePath, buffer)
    } catch (error) {
      console.error("Error writing file:", error)
      return NextResponse.json({ message: "Error saving file" }, { status: 500 })
    }

    // Get the page count for PDF files
    let pageCount = 1
    if (file.name.toLowerCase().endsWith(".pdf")) {
      try {
        const pdfDoc = await PDFDocument.load(buffer)
        pageCount = pdfDoc.getPageCount()
      } catch (error) {
        console.error("Error reading PDF:", error)
        // Continue with default page count if PDF reading fails
      }
    }

    const newPlan = {
      id: plans.length + 1,
      projectId: params.id,
      name: file.name,
      url: `/uploads/${params.id}/${fileName}`,
      uploadedAt: new Date().toISOString(),
      pageCount: pageCount,
    }

    plans.push(newPlan)

    return NextResponse.json(newPlan, { status: 201 })
  } catch (error) {
    console.error("Error processing upload:", error)
    return NextResponse.json({ message: "An error occurred during file upload" }, { status: 500 })
  }
}

