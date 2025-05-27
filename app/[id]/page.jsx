import { VideoPlayer } from "@/components/video-player"
import { VideoFiles } from "@/lib/data"
import { notFound } from "next/navigation"

export default async function VideoPage({ params }) {
  // Ensure params is fully resolved before using it
  const { id } = await params;
  const video = VideoFiles.find((v) => v.id === id);

  if (!video) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">
      <VideoPlayer video={video} />
    </main>
  );
}
