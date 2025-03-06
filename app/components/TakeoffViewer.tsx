"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Document, Page } from "react-pdf"
import { pdfjs } from "react-pdf"
import { Ruler, Move, Square, Save } from "lucide-react"

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

type Plan = {
  id: number
  name: string
  url: string
  uploadedAt: string
  pageCount: number
}

type Measurement = {
  id: number
  planId: number
  type: "length" | "area"
  label: string
  value: number
  unit: string
  points: { x: number; y: number }[]
}

type TakeoffViewerProps = {
  plan: Plan
  measurements: Measurement[]
  onMeasurementSave: (measurement: Omit<Measurement, "id">) => void
}

const SCALE_FACTOR = 0.0254 // 1 pixel = 0.0254 meters (approximate)

export default function TakeoffViewer({ plan, measurements, onMeasurementSave }: TakeoffViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1)
  const [currentTool, setCurrentTool] = useState<"pan" | "length" | "area">("pan")
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([])
  const [pdfData, setPdfData] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [measurementLabel, setMeasurementLabel] = useState("")
  const [showLabelInput, setShowLabelInput] = useState(false)

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const response = await fetch(plan.url)
        const blob = await response.blob()
        const dataUrl = URL.createObjectURL(blob)
        setPdfData(dataUrl)
      } catch (error) {
        console.error("Error loading PDF:", error)
      }
    }

    fetchPdf()
    return () => {
      if (pdfData) {
        URL.revokeObjectURL(pdfData)
      }
    }
  }, [plan.url, pdfData])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const context = canvas.getContext("2d")
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height)
        drawMeasurements(context)
        drawCurrentMeasurement(context)
      }
    }
  }, [measurements, currentPoints, scale])

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setPageNumber(1)
  }

  function handleToolChange(tool: "pan" | "length" | "area") {
    setCurrentTool(tool)
    setCurrentPoints([])
  }

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    if (currentTool === "pan") return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / scale
    const y = (e.clientY - rect.top) / scale

    setIsDrawing(true)
    setCurrentPoints([{ x, y }])
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / scale
    const y = (e.clientY - rect.top) / scale

    if (currentTool === "length") {
      setCurrentPoints([currentPoints[0], { x, y }])
    } else if (currentTool === "area") {
      const points = [...currentPoints]
      points[points.length - 1] = { x, y }
      setCurrentPoints(points)
    }
  }

  function handleMouseUp() {
    if (!isDrawing) return

    setIsDrawing(false)

    if (currentTool === "length" && currentPoints.length === 2) {
      setShowLabelInput(true)
    } else if (currentTool === "area" && currentPoints.length >= 3) {
      setShowLabelInput(true)
    }
  }

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    if (currentTool === "area") {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) / scale
      const y = (e.clientY - rect.top) / scale

      setCurrentPoints([...currentPoints, { x, y }])
    }
  }

  function calculateMeasurement(): number {
    if (currentTool === "length" && currentPoints.length === 2) {
      const [p1, p2] = currentPoints
      return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)) * SCALE_FACTOR
    } else if (currentTool === "area" && currentPoints.length >= 3) {
      let area = 0
      for (let i = 0; i < currentPoints.length; i++) {
        const j = (i + 1) % currentPoints.length
        area += currentPoints[i].x * currentPoints[j].y
        area -= currentPoints[j].x * currentPoints[i].y
      }
      return (Math.abs(area) * SCALE_FACTOR * SCALE_FACTOR) / 2
    }
    return 0
  }

  function handleSaveMeasurement() {
    if (!measurementLabel) return

    const measurement = {
      planId: plan.id,
      type: currentTool === "length" ? "length" : "area",
      label: measurementLabel,
      value: calculateMeasurement(),
      unit: currentTool === "length" ? "m" : "m²",
      points: currentPoints,
    }

    onMeasurementSave(measurement)
    setCurrentPoints([])
    setMeasurementLabel("")
    setShowLabelInput(false)
  }

  function drawMeasurements(context: CanvasRenderingContext2D) {
    measurements.forEach((measurement) => {
      context.beginPath()
      context.moveTo(measurement.points[0].x * scale, measurement.points[0].y * scale)
      measurement.points.forEach((point) => {
        context.lineTo(point.x * scale, point.y * scale)
      })
      if (measurement.type === "area") {
        context.closePath()
        context.fillStyle = "rgba(0, 0, 255, 0.1)"
        context.fill()
      }
      context.strokeStyle = "blue"
      context.stroke()

      // Draw label
      const centerX = measurement.points.reduce((sum, p) => sum + p.x, 0) / measurement.points.length
      const centerY = measurement.points.reduce((sum, p) => sum + p.y, 0) / measurement.points.length
      context.fillStyle = "blue"
      context.fillText(
        `${measurement.label}: ${measurement.value.toFixed(2)}${measurement.unit}`,
        centerX * scale,
        centerY * scale,
      )
    })
  }

  function drawCurrentMeasurement(context: CanvasRenderingContext2D) {
    if (currentPoints.length === 0) return

    context.beginPath()
    context.moveTo(currentPoints[0].x * scale, currentPoints[0].y * scale)
    currentPoints.forEach((point) => {
      context.lineTo(point.x * scale, point.y * scale)
    })
    if (currentTool === "area" && currentPoints.length >= 3) {
      context.closePath()
      context.fillStyle = "rgba(255, 0, 0, 0.1)"
      context.fill()
    }
    context.strokeStyle = "red"
    context.stroke()

    if (currentPoints.length >= 2) {
      const value = calculateMeasurement()
      const centerX = currentPoints.reduce((sum, p) => sum + p.x, 0) / currentPoints.length
      const centerY = currentPoints.reduce((sum, p) => sum + p.y, 0) / currentPoints.length
      context.fillStyle = "red"
      context.fillText(`${value.toFixed(2)}${currentTool === "length" ? "m" : "m²"}`, centerX * scale, centerY * scale)
    }
  }

  if (!pdfData) {
    return <div>Loading PDF...</div>
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex items-center space-x-2">
        <button
          onClick={() => handleToolChange("pan")}
          className={`p-2 rounded ${currentTool === "pan" ? "bg-gray-200" : "hover:bg-gray-100"}`}
          title="Pan Tool"
        >
          <Move size={20} />
        </button>
        <button
          onClick={() => handleToolChange("length")}
          className={`p-2 rounded ${currentTool === "length" ? "bg-gray-200" : "hover:bg-gray-100"}`}
          title="Length Measurement"
        >
          <Ruler size={20} />
        </button>
        <button
          onClick={() => handleToolChange("area")}
          className={`p-2 rounded ${currentTool === "area" ? "bg-gray-200" : "hover:bg-gray-100"}`}
          title="Area Measurement"
        >
          <Square size={20} />
        </button>
      </div>

      {showLabelInput && (
        <div className="mb-4 flex items-center space-x-2">
          <input
            type="text"
            value={measurementLabel}
            onChange={(e) => setMeasurementLabel(e.target.value)}
            placeholder="Enter measurement label"
            className="border rounded px-2 py-1"
          />
          <button
            onClick={handleSaveMeasurement}
            className="bg-blue-500 text-white px-4 py-1 rounded flex items-center"
          >
            <Save size={16} className="mr-1" />
            Save
          </button>
        </div>
      )}

      <div style={{ position: "relative" }}>
        <Document
          file={pdfData}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div>Loading PDF...</div>}
          error={<div>Error loading PDF. Please try again.</div>}
        >
          <Page pageNumber={pageNumber} scale={scale} renderTextLayer={false} renderAnnotationLayer={false} />
        </Document>
        <canvas
          ref={canvasRef}
          width={612 * scale}
          height={792 * scale}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: currentTool === "pan" ? "none" : "auto",
          }}
          onClick={handleClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
    </div>
  )
}

