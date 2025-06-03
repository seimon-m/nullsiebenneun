"use client"

import { useRef, useEffect } from "react"
import { Play, Pause } from "lucide-react"

export function AudioPlayer({ audio, isPlaying, onPlayPause }) {
  const audioRef = useRef(null)

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play()
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying])

  return (
    <div className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      <button
        onClick={onPlayPause}
        className="w-12 h-12 flex items-center justify-center bg-black rounded-full flex-shrink-0"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 text-white" />
        ) : (
          <Play className="w-4 h-4 text-white ml-0.5" />
        )}
      </button>
      <div className="flex-1 min-w-0 flex items-center">
        <p className="text-lg font-medium truncate">{audio.filename}.wav</p>
        <audio ref={audioRef} src={audio.audioUrl} preload="metadata" className="hidden" />
      </div>
    </div>
  )
}
