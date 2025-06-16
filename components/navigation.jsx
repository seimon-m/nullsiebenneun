"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function Navigation({ activeSection }) {
  const pathname = usePathname()

  const navItems = [
    { name: "VIDEOS", href: "/", key: "videos" },
    { name: "AUDIO", href: "/audio", key: "audio" },
    { name: "ABOUT", href: "/about", key: "about" },
  ]

  return (
    <nav className="bg-white py-6 px-4 mt-16 md:mt-30">
      <div className="flex flex-wrap gap-2">
        {navItems.map((item) => {
          const isActive = activeSection === item.key || pathname === item.href

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`px-4 py-1 rounded-full border-2 border-black font-bold text-2xl transition-colors ${
                isActive ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              {item.name}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
