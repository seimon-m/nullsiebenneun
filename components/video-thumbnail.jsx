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
          src={video.thumbnail}
          alt={video.title}
          fill
          className="object-cover"
        />

        {/* Video filename overlay on hover */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ease-in-out ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="relative px-4 py-1 rounded-full border-2 border-black">
            <span className="text-black font-bold text-lg">{video.filename}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
