"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { FileUp, File, Trash2 } from "lucide-react"
import PlanViewer from "../../../components/PlanViewer"

type Plan = {
  id: number
  name: string
  url: string
  uploadedAt: string
  pageCount: number
}

export default function ProjectPlans({ params }: { params: { id: string } }) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}/plans`)
      if (response.ok) {
        const data = await response.json()
        setPlans(data)
      } else {
        setError("Failed to fetch plans")
      }
    } catch (err) {
      setError("An error occurred while fetching plans")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setUploading(true)
    setError("")

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch(`/api/projects/${params.id}/plans`, {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const newPlan = await response.json()
        setPlans([...plans, newPlan])
        setFile(null)
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Failed to upload plan")
      }
    } catch (err) {
      setError("An error occurred while uploading the plan")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (planId: number) => {
    try {
      const response = await fetch(`/api/projects/${params.id}/plans/${planId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setPlans(plans.filter((plan) => plan.id !== planId))
      } else {
        setError("Failed to delete plan")
      }
    } catch (err) {
      setError("An error occurred while deleting the plan")
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Project Plans for Project {params.id}</h1>
      {selectedPlan ? (
        <div>
          <button
            onClick={() => setSelectedPlan(null)}
            className="mb-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Back to Plans List
          </button>
          <PlanViewer plan={selectedPlan} />
        </div>
      ) : (
        <>
          <form onSubmit={handleUpload} className="mb-8">
            <div className="flex items-center space-x-4">
              <input
                type="file"
                onChange={handleFileChange}
                className="border rounded px-2 py-1"
                accept=".pdf,.dwg,.dxf"
              />
              <button
                type="submit"
                disabled={!file || uploading}
                className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition duration-300 disabled:opacity-50 flex items-center"
              >
                <FileUp size={20} className="mr-2" />
                {uploading ? "Uploading..." : "Upload Plan"}
              </button>
            </div>
          </form>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-white shadow-md rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <button onClick={() => handleDelete(plan.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={20} />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-4">Uploaded on: {new Date(plan.uploadedAt).toLocaleString()}</p>
                <p className="text-sm text-gray-500 mb-4">Pages: {plan.pageCount}</p>
                <button
                  onClick={() => setSelectedPlan(plan)}
                  className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition duration-300 flex items-center justify-center w-full"
                >
                  <File size={20} className="mr-2" />
                  View Plan
                </button>
              </div>
            ))}
          </div>
        </>
      )}
      <Link
        href={`/projects/${params.id}`}
        className="mt-8 inline-block text-blue-500 hover:text-blue-700 font-semibold hover:underline"
      >
        ← Back to Project
      </Link>
    </div>
  )
}

