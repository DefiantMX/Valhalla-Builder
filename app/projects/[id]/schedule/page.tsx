"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Calendar, Clock, User, Plus, GripVertical, Download, ZoomIn, ZoomOut } from "lucide-react"
import GanttChart, { TASK_CATEGORIES } from "../../../components/GanttChart"
import AddTaskForm from "../../../components/AddTaskForm"
import { jsPDF } from "jspdf"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"

type ScheduleItem = {
  id: number
  title: string
  startDate: string
  endDate: string
  assignee: string
  status: "Not Started" | "In Progress" | "Completed"
  category?: 1 | 2 | 3 | 4 | 5
}

type SortableTaskItemProps = {
  task: ScheduleItem
  onDelete: (taskId: number) => void
  onUpdateCategory: (taskId: number, category: number) => void
}

function SortableTaskItem({ task, onDelete, onUpdateCategory }: SortableTaskItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id })
  const [isEditing, setIsEditing] = useState(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getStatusColor = (status: ScheduleItem["status"]) => {
    switch (status) {
      case "Not Started":
        return "bg-gray-200 text-gray-800"
      case "In Progress":
        return "bg-blue-200 text-blue-800"
      case "Completed":
        return "bg-green-200 text-green-800"
      default:
        return "bg-gray-200 text-gray-800"
    }
  }

  return (
    <div ref={setNodeRef} style={style} className="bg-white shadow-md rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex-grow">
          <h3 className="text-xl font-semibold mb-2">{task.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Calendar className="mr-2 text-gray-600" size={18} />
              <span className="text-sm text-gray-600">
                {new Date(task.startDate).toLocaleDateString()} - {new Date(task.endDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center">
              <User className="mr-2 text-gray-600" size={18} />
              <span className="text-sm text-gray-600">{task.assignee}</span>
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-4">
            <div className="flex items-center">
              <Clock className="mr-2 text-gray-600" size={18} />
              <span className={`text-sm px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>{task.status}</span>
            </div>
            <div className="flex items-center">
              <select
                value={task.category || 1}
                onChange={(e) => onUpdateCategory(task.id, Number(e.target.value))}
                className="border rounded px-2 py-1 text-sm"
                style={{ backgroundColor: TASK_CATEGORIES[task.category || 1].color }}
              >
                {Object.entries(TASK_CATEGORIES).map(([id, { name }]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={20} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ProjectSchedule({ params }: { params: { id: string } }) {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddTaskForm, setShowAddTaskForm] = useState(false)
  const [chartScale, setChartScale] = useState(1)
  const ganttChartRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  useEffect(() => {
    fetchScheduleItems()
  }, [])

  const fetchScheduleItems = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/projects/${params.id}/tasks`)
      if (!response.ok) {
        throw new Error("Failed to fetch schedule items")
      }
      const data = await response.json()
      setScheduleItems(data)
    } catch (err) {
      setError("An error occurred while fetching the schedule items")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTask = async (newTask: Omit<ScheduleItem, "id">) => {
    try {
      const response = await fetch(`/api/projects/${params.id}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTask),
      })

      if (!response.ok) {
        throw new Error("Failed to add task")
      }

      const addedTask = await response.json()
      setScheduleItems([...scheduleItems, addedTask])
      setShowAddTaskForm(false)
    } catch (err) {
      setError("An error occurred while adding the task")
      console.error(err)
    }
  }

  const handleDelete = async (taskId: number) => {
    try {
      const response = await fetch(`/api/projects/${params.id}/tasks/${taskId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setScheduleItems(scheduleItems.filter((item) => item.id !== taskId))
      } else {
        setError("Failed to delete task")
      }
    } catch (err) {
      setError("An error occurred while deleting the task")
      console.error(err)
    }
  }

  const handleUpdateCategory = async (taskId: number, category: number) => {
    try {
      const response = await fetch(`/api/projects/${params.id}/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ category }),
      })

      if (response.ok) {
        setScheduleItems(scheduleItems.map((item) => (item.id === taskId ? { ...item, category } : item)))
      } else {
        setError("Failed to update task category")
      }
    } catch (err) {
      setError("An error occurred while updating the task")
      console.error(err)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = scheduleItems.findIndex((item) => item.id === active.id)
      const newIndex = scheduleItems.findIndex((item) => item.id === over.id)

      const newItems = [...scheduleItems]
      const [movedItem] = newItems.splice(oldIndex, 1)
      newItems.splice(newIndex, 0, movedItem)

      setScheduleItems(newItems)
    }
  }

  const handleZoomIn = () => {
    setChartScale((prev) => Math.min(prev + 0.2, 2))
  }

  const handleZoomOut = () => {
    setChartScale((prev) => Math.max(prev - 0.2, 0.5))
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    let yOffset = 20

    // Add title
    doc.setFontSize(20)
    doc.text("Project Schedule", 20, yOffset)
    yOffset += 20

    // Add Gantt Chart
    if (ganttChartRef.current) {
      const canvas = ganttChartRef.current.querySelector("canvas")
      if (canvas) {
        const imgData = canvas.toDataURL("image/png")
        doc.addImage(imgData, "PNG", 10, yOffset, 190, 100)
        yOffset += 110
      }
    }

    // Add task list
    doc.setFontSize(16)
    doc.text("Task List", 20, yOffset)
    yOffset += 10

    doc.setFontSize(12)
    scheduleItems.forEach((task) => {
      if (yOffset > 250) {
        doc.addPage()
        yOffset = 20
      }

      doc.text(`• ${task.title}`, 20, yOffset)
      yOffset += 7
      doc.setFontSize(10)
      doc.text(`  Assignee: ${task.assignee}`, 25, yOffset)
      yOffset += 5
      doc.text(
        `  Date: ${new Date(task.startDate).toLocaleDateString()} - ${new Date(task.endDate).toLocaleDateString()}`,
        25,
        yOffset,
      )
      yOffset += 5
      doc.text(`  Status: ${task.status}`, 25, yOffset)
      doc.text(`  Category: ${TASK_CATEGORIES[task.category || 1].name}`, 25, yOffset + 5)
      yOffset += 15
      doc.setFontSize(12)
    })

    doc.save("project-schedule.pdf")
  }

  if (loading) {
    return <div className="text-center mt-8">Loading schedule...</div>
  }

  if (error) {
    return <div className="text-center mt-8 text-red-600">{error}</div>
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Project Schedule for Project {params.id}</h1>
        <button
          onClick={exportToPDF}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <Download className="mr-2" size={20} />
          Export to PDF
        </button>
      </div>

      <div className="mb-8" ref={ganttChartRef}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Gantt Chart</h2>
          <div className="flex items-center space-x-2">
            <button onClick={handleZoomOut} className="p-2 rounded hover:bg-gray-100" disabled={chartScale <= 0.5}>
              <ZoomOut size={20} />
            </button>
            <span className="text-sm text-gray-600">{Math.round(chartScale * 100)}%</span>
            <button onClick={handleZoomIn} className="p-2 rounded hover:bg-gray-100" disabled={chartScale >= 2}>
              <ZoomIn size={20} />
            </button>
          </div>
        </div>
        <GanttChart tasks={scheduleItems} scale={chartScale} />
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Tasks</h2>
        <button
          onClick={() => setShowAddTaskForm(true)}
          className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition duration-300 flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Add Task
        </button>
      </div>

      {showAddTaskForm && <AddTaskForm onAddTask={handleAddTask} onCancel={() => setShowAddTaskForm(false)} />}

      {scheduleItems.length === 0 ? (
        <p className="text-center text-gray-600">No schedule items found for this project.</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext items={scheduleItems} strategy={verticalListSortingStrategy}>
            {scheduleItems.map((task) => (
              <SortableTaskItem
                key={task.id}
                task={task}
                onDelete={handleDelete}
                onUpdateCategory={handleUpdateCategory}
              />
            ))}
          </SortableContext>
        </DndContext>
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

