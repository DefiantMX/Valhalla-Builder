"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { FileText, Download, Check } from "lucide-react"
import BidSummaryPDF from "../../../components/BidSummaryPDF"

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

type Bid = {
  id: number
  contractor: string
  amount: number
  division: string
  submissionDate: string
  documentUrl?: string
  description?: string
}

type Project = {
  id: number
  name: string
  description: string
  status: string
  startDate: string
  endDate: string
}

export default function ProjectBids({ params }: { params: { id: string } }) {
  const [bids, setBids] = useState<Bid[]>([])
  const [project, setProject] = useState<Project | null>(null)
  const [selectedBids, setSelectedBids] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Fetch project and bids on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch project details
        const projectResponse = await fetch(`/api/projects/${params.id}`)
        if (!projectResponse.ok) {
          throw new Error("Failed to fetch project details")
        }
        const projectData = await projectResponse.json()
        setProject(projectData)

        // Fetch bids
        const bidsResponse = await fetch(`/api/projects/${params.id}/bids`)
        if (!bidsResponse.ok) {
          throw new Error("Failed to fetch bids")
        }
        const bidsData = await bidsResponse.json()
        setBids(bidsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while fetching data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  const toggleBidSelection = (bidId: number) => {
    const newSelected = new Set(selectedBids)
    if (newSelected.has(bidId)) {
      newSelected.delete(bidId)
    } else {
      newSelected.add(bidId)
    }
    setSelectedBids(newSelected)
  }

  // Group bids by division
  const bidsByDivision = bids.reduce((acc: { [key: string]: Bid[] }, bid: Bid) => {
    if (!acc[bid.division]) {
      acc[bid.division] = []
    }
    acc[bid.division].push(bid)
    return acc
  }, {})

  // Calculate division totals and lowest bids
  const divisionStats = Object.entries(bidsByDivision).reduce(
    (acc: { [key: string]: { total: number; lowest: number } }, [division, divisionBids]) => {
      const bidsArray = divisionBids as Bid[]
      acc[division] = {
        total: bidsArray.reduce((sum, bid) => sum + bid.amount, 0),
        lowest: Math.min(...bidsArray.map((bid) => bid.amount)),
      }
      return acc
    },
    {},
  )

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>
  }

  if (!project) {
    return <div className="text-red-500 text-center py-8">Project not found</div>
  }

  const selectedBidsArray = bids.filter((bid) => selectedBids.has(bid.id))

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold">Bids for {project.name}</h1>
          <p className="text-gray-600 mt-1">Project Status: {project.status}</p>
        </div>
        <div className="flex space-x-4">
          <Link
            href={`/projects/${params.id}/bids/new`}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Submit New Bid
          </Link>
          {selectedBids.size > 0 && (
            <BidSummaryPDF
              selectedBids={selectedBidsArray}
              divisions={DIVISIONS}
              projectId={params.id}
              projectName={project.name}
            />
          )}
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(bidsByDivision).map(([division, divisionBids]) => (
          <div key={division} className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="bg-gray-100 p-4 border-b">
              <h2 className="text-xl font-semibold">
                Division {division} - {DIVISIONS[division as keyof typeof DIVISIONS]}
              </h2>
              <div className="mt-2 text-sm text-gray-600">
                <p>Total Bids: ${divisionStats[division].total.toLocaleString()}</p>
                <p>Lowest Bid: ${divisionStats[division].lowest.toLocaleString()}</p>
              </div>
            </div>
            <ul className="divide-y divide-gray-200">
              {(divisionBids as Bid[]).map((bid) => (
                <li key={bid.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-4">
                      <button
                        onClick={() => toggleBidSelection(bid.id)}
                        className={`mt-1 w-6 h-6 rounded border ${
                          selectedBids.has(bid.id)
                            ? "bg-blue-500 border-blue-500 text-white"
                            : "border-gray-300 hover:border-blue-500"
                        } flex items-center justify-center transition-colors`}
                      >
                        {selectedBids.has(bid.id) && <Check className="h-4 w-4" />}
                      </button>
                      <div>
                        <p className="font-semibold text-lg">{bid.contractor}</p>
                        <p className="text-gray-600">Amount: ${bid.amount.toLocaleString()}</p>
                        <p className="text-gray-600">Submitted: {new Date(bid.submissionDate).toLocaleDateString()}</p>
                        {bid.description && <p className="text-gray-600 mt-2 text-sm">{bid.description}</p>}
                      </div>
                    </div>
                    {bid.documentUrl && (
                      <a
                        href={bid.documentUrl}
                        download
                        className="flex items-center text-blue-500 hover:text-blue-700"
                      >
                        <FileText className="h-5 w-5 mr-1" />
                        <Download className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {Object.keys(bidsByDivision).length === 0 && (
          <p className="text-gray-500 text-center py-8">No bids submitted yet.</p>
        )}
      </div>

      <div className="mt-4">
        <Link href={`/projects/${params.id}`} className="text-blue-500 hover:underline">
          Back to Project Details
        </Link>
      </div>
    </div>
  )
}

