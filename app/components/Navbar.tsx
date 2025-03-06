"use client"

import Link from "next/link"
import { useAuth } from "../contexts/AuthContext"
import { Menu, X, Shield } from "lucide-react"
import { useState } from "react"
import { UserRole, type Permission } from "@/lib/permissions"
import VikingLogo from "./VikingLogo"

export default function Navbar() {
  const { user, logout, hasPermission } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-slate-900 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-2">
          <Link href="/" className="flex items-center">
            <VikingLogo size={40} className="mr-2" />
            <span className="text-xl font-bold text-white font-serif">VALHALLA BUILDER</span>
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            <NavLinks />
            <UserMenu user={user} logout={logout} hasPermission={hasPermission} />
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-slate-800 py-2">
          <div className="container mx-auto px-4 flex flex-col space-y-2">
            <NavLinks />
            <UserMenu user={user} logout={logout} hasPermission={hasPermission} />
          </div>
        </div>
      )}
    </nav>
  )
}

function NavLinks() {
  return (
    <>
      <Link href="/projects" className="text-white hover:text-sky-400 transition-colors">
        Projects
      </Link>
      <Link href="/tasks" className="text-white hover:text-emerald-400 transition-colors">
        Tasks
      </Link>
      <Link href="/documents" className="text-white hover:text-amber-400 transition-colors">
        Documents
      </Link>
    </>
  )
}

function UserMenu({
  user,
  logout,
  hasPermission,
}: {
  user: any
  logout: () => void
  hasPermission: (permission: Permission) => boolean
}) {
  return user ? (
    <div className="flex items-center space-x-4">
      <span className="text-slate-300">Welcome, {user.username}</span>

      {user.role === UserRole.Admin && (
        <Link href="/admin" className="text-purple-400 hover:text-purple-300 flex items-center">
          <Shield size={16} className="mr-1" />
          Admin
        </Link>
      )}

      <button
        onClick={() => {
          fetch("/api/logout", { method: "POST" }).then(() => logout())
        }}
        className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg transition duration-300"
      >
        Logout
      </button>
    </div>
  ) : (
    <div className="space-x-4">
      <Link href="/login" className="text-white hover:text-sky-400 transition-colors">
        Login
      </Link>
      <Link
        href="/register"
        className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg transition duration-300"
      >
        Register
      </Link>
    </div>
  )
}

