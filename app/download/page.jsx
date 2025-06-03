"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { getAudioFiles } from "@/lib/data"
import { Download, Play, Pause } from "lucide-react"

export default function DownloadPage() {
  const audioFiles = getAudioFiles()
  const [playingId, setPlayingId] = useState(null)

  const handlePlay = (id) => {
    setPlayingId(id === playingId ? null : id)
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="pt-8">
        <Navigation activeSection="download" />
        <div className="container mx-auto pt-8 px-4 pb-12">
          <h1 className="text-2xl font-bold mb-8">AUDIO FILES (.WAV)</h1>

          <div className="border-t border-gray-200">
            {audioFiles.map((audio) => (
              <div key={audio.id} className="py-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handlePlay(audio.id)}
                    className="w-10 h-10 flex items-center justify-center bg-black rounded-full flex-shrink-0"
                  >
                    {playingId === audio.id ? (
                      <Pause className="w-4 h-4 text-white" />
                    ) : (
                      <Play className="w-4 h-4 text-white ml-0.5" />
                    )}
                  </button>
                  <div>
                    <span className="text-lg block">{audio.filename}.wav</span>
                    <span className="text-sm text-gray-500">{audio.fileSize}</span>
                  </div>
                  {playingId === audio.id && (
                    <audio src={audio.audioUrl} autoPlay onEnded={() => setPlayingId(null)} className="hidden" />
                  )}
                </div>
                <a
                  href={audio.audioUrl}
                  download
                  className="flex items-center gap-2 px-4 py-2 border-2 border-black rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
