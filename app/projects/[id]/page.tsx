import Link from "next/link"
import { projectStore } from "@/lib/store"

export default async function ProjectDetails({ params }: { params: { id: string } }) {
  const projectId = Number.parseInt(params.id, 10)
  const project = projectStore.getProject(projectId)

  // If project doesn't exist, show a not found message
  if (!project) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Project Not Found</h1>
        <p className="text-gray-600 mb-4">The requested project could not be found.</p>
        <Link href="/projects" className="text-blue-500 hover:underline">
          Back to Projects
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{project.name}</h1>
      <div className="bg-white shadow-md rounded-lg p-4 mb-4">
        <p className="text-gray-600 mb-2">
          <strong>Status:</strong> {project.status}
        </p>
        <p className="text-gray-600 mb-2">
          <strong>Start Date:</strong>{" "}
          {project.startDate ? new Date(project.startDate).toLocaleDateString() : "Not set"}
        </p>
        <p className="text-gray-600 mb-2">
          <strong>End Date:</strong> {project.endDate ? new Date(project.endDate).toLocaleDateString() : "Not set"}
        </p>
        <p className="text-gray-600 mb-4">
          <strong>Description:</strong> {project.description || "No description provided"}
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href={`/projects/${project.id}/bids`}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
          >
            View Bids
          </Link>
          <Link
            href={`/projects/${project.id}/plans`}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
          >
            Project Plans
          </Link>
          <Link
            href={`/projects/${project.id}/takeoff`}
            className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
          >
            Takeoff
          </Link>
          <Link
            href={`/projects/${project.id}/daily-log`}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
          >
            Daily Log
          </Link>
          <Link
            href={`/projects/${project.id}/schedule`}
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
          >
            Project Schedule
          </Link>
        </div>
      </div>
      <Link href="/projects" className="mt-4 inline-block text-blue-500 hover:underline">
        Back to Projects
      </Link>
    </div>
  )
}

