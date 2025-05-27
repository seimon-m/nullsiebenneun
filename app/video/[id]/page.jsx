import { VideoPlayer } from "@/components/video-player"
import { VideoFiles } from "@/lib/data"
import { notFound } from "next/navigation"

export default async function VideoPage({ params }) {
  const video = VideoFiles.find((v) => v.id === params.id)

  if (!video) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-white">
      <VideoPlayer video={video} />
    </main>
  )
}
