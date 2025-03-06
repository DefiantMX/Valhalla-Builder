import Link from "next/link"
import VikingLogo from "./components/VikingLogo"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.32))] -mt-8 bg-slate-900">
      <div className="text-center mb-8">
        <VikingLogo size={250} className="mb-6" />
        <h1 className="text-5xl font-bold mb-4 text-white font-serif">VALHALLA BUILDER</h1>
        <p className="text-slate-400 max-w-md mx-auto">
          The ultimate construction management platform for modern warriors of the building industry
        </p>
      </div>

      <nav className="flex flex-wrap justify-center gap-4">
        <Link
          href="/projects"
          className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
        >
          Projects
        </Link>
        <Link
          href="/tasks"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
        >
          Tasks
        </Link>
        <Link
          href="/documents"
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
        >
          Documents
        </Link>
        <Link
          href="/messages"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
        >
          Messages
        </Link>
        <Link
          href="/finances"
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
        >
          Finances
        </Link>
      </nav>
    </div>
  )
}

