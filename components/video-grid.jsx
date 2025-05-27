"use client"

import { VideoFiles } from "@/lib/data"
import { VideoThumbnail } from "@/components/video-thumbnail"
import styles from "./video-grid.module.css"

export function VideoGrid() {
  return (
    <div className={`w-full ${styles.grid}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
        {VideoFiles.map((video) => (
          <VideoThumbnail key={video.id} video={video} />
        ))}
      </div>
    </div>
  )
}
