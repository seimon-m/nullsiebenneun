"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"

export function VideoThumbnail({ video }) {
  const [isHovered, setIsHovered] = useState(false)
  const videoRef = useRef(null)
  const [isPreloaded, setIsPreloaded] = useState(false)

  // Preload video when component mounts
  useEffect(() => {
    const preloadVideo = () => {
      const link = document.createElement("link")
      link.rel = "preload"
      link.href = video.videoUrl
      link.as = "video"
      document.head.appendChild(link)
      setIsPreloaded(true)
    }

    preloadVideo()

    return () => {
      // Clean up preload link when component unmounts
      const links = document.head.querySelectorAll(`link[href="${video.videoUrl}"]`)
      links.forEach((link) => document.head.removeChild(link))
    }
  }, [video.videoUrl])

  return (
    <Link
      href={`/${video.id}`}
      className="relative block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full" style={{ aspectRatio: "21/9" }}>
        <Image
          src={video.thumbnail || "/placeholder.svg?height=400&width=840"}
          alt={video.title}
          fill
          className="object-cover"
        />

        {/* Video filename overlay on hover */}
        {isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white px-4 py-2 rounded">
              <span className="text-black font-bold text-sm">{video.filename}</span>
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
