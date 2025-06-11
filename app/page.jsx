"use client"

import { VideoGrid } from "@/components/video-grid"
import { Navigation } from "@/components/navigation"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="pt-8">
        <Navigation activeSection="videos" />
        <VideoGrid />
      </div>
    </main>
  )
}
