import Link from "next/link"

export default function Tasks() {
  const tasks = [
    { id: 1, name: "Foundation Work", project: "Residential Complex", dueDate: "2023-06-15" },
    { id: 2, name: "Electrical Wiring", project: "Office Building", dueDate: "2023-07-01" },
    { id: 3, name: "Interior Design", project: "Shopping Mall", dueDate: "2023-06-30" },
  ]

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Tasks</h1>
      <ul className="space-y-4">
        {tasks.map((task) => (
          <li key={task.id} className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-semibold">{task.name}</h2>
            <p className="text-gray-600">Project: {task.project}</p>
            <p className="text-gray-600">Due Date: {task.dueDate}</p>
          </li>
        ))}
      </ul>
      <Link href="/" className="mt-4 inline-block bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
        Back to Home
      </Link>
    </div>
  )
}

