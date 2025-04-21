"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, FileCheck, Shield } from "lucide-react"

export default function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { name: "Upload", href: "/", icon: FileText },
    { name: "Generate Proof", href: "/generate-proof", icon: FileCheck },
    { name: "Verify", href: "/verify", icon: Shield },
  ]

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-emerald-600" />
              <span className="text-xl font-bold text-gray-900">DocAuth</span>
            </Link>
          </div>

          <nav className="flex space-x-1 md:space-x-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="mr-2 h-5 w-5" />
                  <span className="hidden md:inline">{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}
