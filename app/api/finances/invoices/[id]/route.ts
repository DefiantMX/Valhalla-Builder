import { NextResponse } from "next/server"

// This is a mock invoice database. In a real application, you'd use a proper database.
const invoices: any[] = []

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const projectId = Number.parseInt(params.id, 10)
  const projectInvoices = invoices.filter((invoice) => invoice.projectId === projectId)

  // Sort by date, newest first
  projectInvoices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return NextResponse.json(projectInvoices)
}

