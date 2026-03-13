"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

export function VideoThumbnail({ video }) {
  const [isHovered, setIsHovered] = useState(false)

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
