"use client"

import { useRef, useState, useEffect } from "react"
import { Play, Pause, Download } from "lucide-react"
// import { WaveformVisualizer } from "./waveform-visualizer"

export function AudioPlayer({ audio, isPlaying, onPlayPause }) {
  const audioRef = useRef(null)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const displayName = audio?.filename || audio?.title || 'Audio File'

  // Handle play/pause and time updates
  useEffect(() => {
    const audioElement = audioRef.current
    if (!audioElement) return

    const handleTimeUpdate = () => {
      setCurrentTime(audioElement.currentTime)
      if (!duration) setDuration(audioElement.duration || 0)
    }

    const handleLoadedMetadata = () => {
      setDuration(audioElement.duration || 0)
    }

    audioElement.addEventListener('timeupdate', handleTimeUpdate)
    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata)

    if (isPlaying) {
      audioElement.play().catch(e => console.error("Audio playback failed:", e))
    } else {
      audioElement.pause()
    }

    return () => {
      audioElement.removeEventListener('timeupdate', handleTimeUpdate)
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [isPlaying, duration])

  if (!audio?.audioUrl) {
    return null;
  }

  // Load duration when audio URL changes
  useEffect(() => {
    if (audioRef.current) {
      const handleLoadedMetadata = () => {
        if (audioRef.current) {
          setDuration(Math.floor(audioRef.current.duration) || 0);
        }
      };

      // Set up event listener for metadata load
      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);

      // If metadata is already loaded, get duration immediately
      if (audioRef.current.readyState > 0) {
        handleLoadedMetadata();
      }

      return () => {
        audioRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [audio.audioUrl]);

  return (
    <div className="w-full group relative overflow-hidden rounded-lg border border-gray-200 hover:shadow-sm transition-shadow bg-white">
      <div className="relative z-10 h-16 p-4 flex items-center">
        <div className="absolute inset-0 right-32 bg-gradient-to-r from-white to-transparent z-0"></div>
        <div className="flex items-center space-x-3 relative z-10 w-full">
          <button
            onClick={onPlayPause}
            className="w-8 h-8 flex items-center justify-center bg-white rounded-full flex-shrink-0
                     border border-gray-200 shadow-sm hover:scale-105 transition-transform"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 text-gray-900" />
            ) : (
              <Play className="w-3.5 h-3.5 text-gray-900 ml-0.5" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <p className="font-medium truncate text-sm text-gray-900">{displayName}</p>
            <div className="text-xs text-gray-500">
              {formatTime(isPlaying ? currentTime : 0)} / {formatTime(duration)}
            </div>
          </div>

          <a
            href={audio.audioUrl}
            download
            className="ml-2 p-3 rounded-full hover:bg-gray-100 transition-colors"
            title="Download"
            onClick={(e) => e.stopPropagation()}
          >
            <Download className="w-4 h-4 text-gray-900" />
          </a>

          <audio
            ref={audioRef}
            src={audio.audioUrl}
            preload="metadata"
            className="hidden"
            onError={(e) => console.error("Audio load error:", e)}
            onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
          />
        </div>

        {/* <div className="absolute right-4 top-0 bottom-0 w-32">
          <div className="relative w-full h-full">
            <WaveformVisualizer
              audioUrl={audio.audioUrl}
              isPlaying={isPlaying}
              currentTime={isPlaying ? currentTime : 0}
              duration={duration || 1}
            />
          </div>
        </div> */}
      </div>
    </div>
  )
}

// Helper function to format time (seconds to MM:SS)
function formatTime(seconds) {
  if (!seconds) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}
