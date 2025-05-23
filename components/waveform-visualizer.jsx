"use client"

import { useRef, useEffect } from "react"
import { motion } from "framer-motion"

export function WaveformVisualizer({ audioUrl, isPlaying, currentTime, duration }) {
  const canvasRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const sourceRef = useRef(null)
  const bufferRef = useRef(null)
  const animationRef = useRef(0)
  const dataArrayRef = useRef(null)

  // Initialize audio context and load audio file
  useEffect(() => {
    const initAudio = async () => {
      try {
        // Create audio context
        const AudioContext = window.AudioContext || window.webkitAudioContext
        audioContextRef.current = new AudioContext()
        analyserRef.current = audioContextRef.current.createAnalyser()
        analyserRef.current.fftSize = 256

        // Fetch audio data
        const response = await fetch(audioUrl)
        const arrayBuffer = await response.arrayBuffer()

        // Decode audio data
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer)
        bufferRef.current = audioBuffer

        // Create data array for visualization
        const bufferLength = analyserRef.current.frequencyBinCount
        dataArrayRef.current = new Uint8Array(bufferLength)

        // Draw initial waveform
        drawWaveform()
      } catch (error) {
        console.error("Error initializing audio:", error)
      }
    }

    initAudio()

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [audioUrl])

  // Handle play/pause state
  useEffect(() => {
    if (!audioContextRef.current || !bufferRef.current || !analyserRef.current) return

    if (isPlaying) {
      // Resume audio context if suspended
      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume()
      }

      // Start visualization
      visualize()
    } else {
      // Pause visualization
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying])

  // Draw static waveform from audio buffer
  const drawWaveform = () => {
    if (!canvasRef.current || !bufferRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = canvas.offsetHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Get audio data
    const buffer = bufferRef.current
    const data = buffer.getChannelData(0)
    const step = Math.ceil(data.length / canvas.width)
    const amp = canvas.height / 2

    // Draw waveform
    ctx.beginPath()
    ctx.moveTo(0, amp)

    // Draw the full waveform in gray
    ctx.strokeStyle = "#333"
    ctx.lineWidth = 1

    for (let i = 0; i < canvas.width; i++) {
      const min = 1.0
      let max = -1.0
      let minVal = min

      for (let j = 0; j < step; j++) {
        const datum = data[i * step + j]

        if (datum < minVal) minVal = datum
        if (datum > max) max = datum
      }

      ctx.lineTo(i, (1 + minVal) * amp)
      ctx.lineTo(i, (1 + max) * amp)
    }

    ctx.stroke()
  }

  // Animate waveform based on current playback
  const visualize = () => {
    if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Get canvas dimensions
    const width = canvas.offsetWidth
    const height = canvas.offsetHeight

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw static waveform
    drawWaveform()

    // Draw progress overlay
    if (duration > 0) {
      const progress = currentTime / duration
      const progressWidth = width * progress

      ctx.fillStyle = "rgba(255, 182, 193, 0.3)"
      ctx.fillRect(0, 0, progressWidth, height)
    }

    // Continue animation
    animationRef.current = requestAnimationFrame(visualize)
  }

  return (
    <motion.div
      className="w-full h-24 mt-4 mb-6 bg-[#1a1a1a] border border-[#333] overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </motion.div>
  )
}
