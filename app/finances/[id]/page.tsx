"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, FileText, Download, Calendar, Tag } from "lucide-react"
import { projectStore } from "@/lib/store"
import MonthlyDraws from "../../components/MonthlyDraws"

// Construction divisions
const DIVISIONS = {
  "01": "General Requirements",
  "02": "Existing Conditions",
  "03": "Concrete",
  "04": "Masonry",
  "05": "Metals",
  "06": "Wood, Plastics, and Composites",
  "07": "Thermal and Moisture Protection",
  "08": "Openings",
  "09": "Finishes",
  "10": "Specialties",
  "11": "Equipment",
  "12": "Furnishings",
  "13": "Special Construction",
  "14": "Conveying Equipment",
  "21": "Fire Suppression",
  "22": "Plumbing",
  "23": "Heating, Ventilating, and Air Conditioning",
  "26": "Electrical",
  "27": "Communications",
  "28": "Electronic Safety and Security",
  "31": "Earthwork",
  "32": "Exterior Improvements",
  "33": "Utilities",
}

type Invoice = {
  id: number
  projectId: number
  division: string
  vendor: string
  amount: number
  date: string
  description: string
  fileUrl?: string
}

type DivisionBudget = {
  id: string
  name: string
  budget: number
  spent: number
}

type ProjectBudget = {
  projectId: number
  totalBudget: number
  totalSpent: number
  divisions: DivisionBudget[]
}

export default function ProjectFinances({ params }: { params: { id: string } }) {
  const projectId = Number.parseInt(params.id, 10)
  const [project, setProject] = useState(projectStore.getProject(projectId))
  const [budget, setBudget] = useState<ProjectBudget | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<"overview" | "invoices" | "budget" | "draws">("overview")

  useEffect(() => {
    fetchBudget()
    fetchInvoices()
  }, [])

  const fetchBudget = async () => {
    try {
      const response = await fetch(`/api/finances/budgets/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setBudget(data)
      } else {
        setError("Failed to fetch budget data")
      }
    } catch (err) {
      setError("An error occurred while fetching budget data")
    } finally {
      setLoading(false)
    }
  }

  const fetchInvoices = async () => {
    try {
      const response = await fetch(`/api/finances/invoices/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setInvoices(data)
      } else {
        setError("Failed to fetch invoices")
      }
    } catch (err) {
      setError("An error occurred while fetching invoices")
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!project) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Project Not Found</h1>
        <p className="text-gray-600 mb-4">The requested project could not be found.</p>
        <Link href="/finances" className="text-blue-500 hover:underline">
          Back to Finances
        </Link>
      </div>
    )
  }

  const renderOverview = () => {
    if (!budget) return <p>No budget data available</p>

    return (
      <div className="space-y-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Financial Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold">${budget.totalBudget.toLocaleString()}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold">${budget.totalSpent.toLocaleString()}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Remaining</p>
              <p className="text-2xl font-bold">${(budget.totalBudget - budget.totalSpent).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Invoices</h2>
          {invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Vendor</th>
                    <th className="text-left p-2">Division</th>
                    <th className="text-right p-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.slice(0, 5).map((invoice) => (
                    <tr key={invoice.id} className="border-b">
                      <td className="p-2">{new Date(invoice.date).toLocaleDateString()}</td>
                      <td className="p-2">{invoice.vendor}</td>
                      <td className="p-2">{DIVISIONS[invoice.division as keyof typeof DIVISIONS]}</td>
                      <td className="p-2 text-right">${invoice.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No invoices found</p>
          )}
          <button onClick={() => setActiveTab("invoices")} className="mt-4 text-blue-500 hover:underline">
            View all invoices
          </button>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Division Breakdown</h2>
          {budget.divisions.length > 0 ? (
            <div className="space-y-4">
              {budget.divisions.map((division) => {
                const percentSpent = division.budget > 0 ? Math.round((division.spent / division.budget) * 100) : 0

                return (
                  <div key={division.id} className="border-b pb-4">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{division.name}</span>
                      <span>
                        ${division.spent.toLocaleString()} / ${division.budget.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${
                          percentSpent > 90 ? "bg-red-500" : percentSpent > 70 ? "bg-yellow-500" : "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(percentSpent, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No division data available</p>
          )}
          <button onClick={() => setActiveTab("budget")} className="mt-4 text-blue-500 hover:underline">
            View full budget
          </button>
        </div>
      </div>
    )
  }

  const renderInvoices = () => {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">All Invoices</h2>
        {invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Vendor</th>
                  <th className="text-left p-2">Division</th>
                  <th className="text-left p-2">Description</th>
                  <th className="text-right p-2">Amount</th>
                  <th className="text-center p-2">File</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-2 text-gray-500" />
                        {new Date(invoice.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-2">{invoice.vendor}</td>
                    <td className="p-2">
                      <div className="flex items-center">
                        <Tag size={16} className="mr-2 text-gray-500" />
                        {DIVISIONS[invoice.division as keyof typeof DIVISIONS]}
                      </div>
                    </td>
                    <td className="p-2">{invoice.description}</td>
                    <td className="p-2 text-right font-medium">${invoice.amount.toLocaleString()}</td>
                    <td className="p-2 text-center">
                      {invoice.fileUrl ? (
                        <a
                          href={invoice.fileUrl}
                          download
                          className="inline-flex items-center text-blue-500 hover:text-blue-700"
                        >
                          <Download size={18} />
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText size={48} className="mx-auto mb-4 text-gray-400" />
            <p>No invoices found for this project</p>
          </div>
        )}
      </div>
    )
  }

  const renderBudget = () => {
    if (!budget) return <p>No budget data available</p>

    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Project Budget</h2>
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold">${budget.totalBudget.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold">${budget.totalSpent.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Remaining</p>
              <p className="text-2xl font-bold">${(budget.totalBudget - budget.totalSpent).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <h3 className="font-medium text-lg mb-4">Division Breakdown</h3>
        {budget.divisions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Division</th>
                  <th className="text-right p-2">Budget</th>
                  <th className="text-right p-2">Spent</th>
                  <th className="text-right p-2">Remaining</th>
                  <th className="text-right p-2">% Used</th>
                </tr>
              </thead>
              <tbody>
                {budget.divisions.map((division) => {
                  const remaining = division.budget - division.spent
                  const percentUsed = division.budget > 0 ? Math.round((division.spent / division.budget) * 100) : 0

                  return (
                    <tr key={division.id} className="border-b">
                      <td className="p-2">{division.name}</td>
                      <td className="p-2 text-right">${division.budget.toLocaleString()}</td>
                      <td className="p-2 text-right">${division.spent.toLocaleString()}</td>
                      <td className="p-2 text-right">${remaining.toLocaleString()}</td>
                      <td className="p-2 text-right">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            percentUsed > 90
                              ? "bg-red-100 text-red-800"
                              : percentUsed > 70
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {percentUsed}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No division data available</p>
        )}
      </div>
    )
  }

  const renderDraws = () => {
    return <MonthlyDraws projectId={projectId} />
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Link href="/finances" className="text-blue-500 hover:underline flex items-center">
          <ArrowLeft size={16} className="mr-1" />
          Back to Finances
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{project.name} Finances</h1>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("invoices")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "invoices"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Invoices
            </button>
            <button
              onClick={() => setActiveTab("budget")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "budget"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Budget
            </button>
            <button
              onClick={() => setActiveTab("draws")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "draws"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Monthly Draws
            </button>
          </nav>
        </div>
      </div>

      {activeTab === "overview" && renderOverview()}
      {activeTab === "invoices" && renderInvoices()}
      {activeTab === "budget" && renderBudget()}
      {activeTab === "draws" && renderDraws()}
    </div>
  )
}

