"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import CreateProjectForm from "../components/CreateProjectForm"
import { PlusCircle, ChevronRight } from "lucide-react"
import type { Project } from "@/lib/store"

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    const response = await fetch("/api/projects")
    if (response.ok) {
      const data = await response.json()
      setProjects(data)
    }
  }

  const handleProjectCreated = (newProject: Project) => {
    setProjects([...projects, newProject])
    setShowCreateForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Projects</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          <PlusCircle size={20} className="mr-2" />
          Create Project
        </button>
      </div>
      {showCreateForm && (
        <CreateProjectForm onProjectCreated={handleProjectCreated} onCancel={() => setShowCreateForm(false)} />
      )}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link key={project.id} href={`/projects/${project.id}`}>
            <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition duration-300">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{project.name}</h2>
              <p className="text-gray-600 mb-4">Status: {project.status}</p>
              <div className="flex justify-end items-center text-gray-800 hover:text-gray-600">
                View Details
                <ChevronRight size={20} className="ml-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

