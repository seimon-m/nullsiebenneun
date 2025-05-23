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
    <div className="flex items-start space-x-4">
      <button
        onClick={onPlayPause}
        className="w-16 h-16 flex items-center justify-center bg-black rounded-full flex-shrink-0"
      >
        {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white ml-1" />}
      </button>
      <div className="flex flex-col">
        <span className="text-gray-500 text-lg">{audio.audioFilename}</span>
        <span className="text-gray-500 text-lg">{audio.audioFilename}</span>
        <audio ref={audioRef} src={audio.audioUrl} preload="metadata" className="hidden" />
      </div>
    </div>
  )
}
