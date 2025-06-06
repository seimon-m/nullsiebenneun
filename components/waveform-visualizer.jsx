"use client"

import { useRef, useEffect, useCallback, useState } from 'react';

export function WaveformVisualizer({ audioUrl, isPlaying, currentTime, duration }) {
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationRef = useRef(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const resizeObserverRef = useRef(null);

  // Initialize audio context and analyzer
  const initAudio = useCallback(async () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 64; // Lower FFT size for smoother visualization

      // Set up audio source
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

      sourceRef.current = audioContextRef.current.createBufferSource();
      sourceRef.current.buffer = audioBuffer;
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);

    } catch (error) {
      console.error("Error initializing audio:", error);
    }
  }, [audioUrl]);

  // Draw the waveform
  const visualize = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = dimensions;

    // Only proceed if we have valid dimensions
    if (width === 0 || height === 0) {
      animationRef.current = requestAnimationFrame(visualize);
      return;
    }

    // Set canvas display size and render size
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Get frequency data or use empty data when not playing
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    if (isPlaying) {
      analyserRef.current.getByteFrequencyData(dataArray);
    } else {
      // Create a static waveform pattern when not playing
      for (let i = 0; i < bufferLength; i++) {
        // Create a wave-like pattern
        const value = Math.sin(i / bufferLength * Math.PI * 4) * 30 + 50;
        dataArray[i] = Math.max(0, Math.min(255, value));
      }
    }

    // Draw waveform
    const barCount = Math.min(32, Math.floor(width / 4)); // Dynamic bar count based on width
    const barWidth = width / (barCount * 1.2);
    const barSpacing = barWidth * 0.2;
    const centerY = height / 2;
    const maxBarHeight = height * 0.8;

    for (let i = 0; i < barCount; i++) {
      // Get average of a segment of the frequency data
      const segmentSize = Math.floor(bufferLength / barCount);
      const start = i * segmentSize;
      const end = Math.min(start + segmentSize, bufferLength);
      let sum = 0;

      for (let j = start; j < end; j++) {
        sum += dataArray[j] || 0;
      }

      const average = sum / (end - start);
      const barHeight = Math.max(2, (average / 255) * maxBarHeight);

      // Calculate position
      const x = i * (barWidth + barSpacing);
      const y = centerY - (barHeight / 2);

      // Draw bar with black color
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');

      ctx.fillStyle = gradient;

      // Draw rounded rectangle
      const radius = Math.min(barWidth / 2, 4);
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + barWidth - radius, y);
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
      ctx.lineTo(x + barWidth, y + barHeight - radius);
      ctx.quadraticCurveTo(x + barWidth, y + barHeight, x + barWidth - radius, y + barHeight);
      ctx.lineTo(x + radius, y + barHeight);
      ctx.quadraticCurveTo(x, y + barHeight, x, y + barHeight - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();
    }

    // Draw progress indicator
    if (duration > 0) {
      const progress = (currentTime % duration) / duration;
      const progressX = width * progress;

      // Draw progress overlay
      const progressGradient = ctx.createLinearGradient(0, 0, 0, height);
      progressGradient.addColorStop(0, 'rgba(0, 0, 0, 0.1)');
      progressGradient.addColorStop(1, 'rgba(0, 0, 0, 0.05)');

      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = progressGradient;
      ctx.fillRect(0, 0, progressX, height);
      ctx.globalCompositeOperation = 'source-over';
    }

    // Continue animation loop
    animationRef.current = requestAnimationFrame(visualize);
  }, [dimensions, currentTime, duration]);

  // Handle play/pause state and audio source management
  useEffect(() => {
    if (!audioContextRef.current || !analyserRef.current) return;

    let source = null;

    const stopPlayback = () => {
      if (source) {
        try {
          source.stop();
          source.disconnect();
        } catch (e) {
          // Ignore errors when stopping already stopped source
        }
        source = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };

    if (isPlaying) {
      // Resume audio context if suspended
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(console.error);
      }

      // Create a new source node
      source = audioContextRef.current.createBufferSource();
      source.buffer = sourceRef.current?.buffer; // Use the pre-loaded buffer if available
      source.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);

      // Start playback from current time
      const startTime = currentTime % (duration || 1);
      source.start(0, startTime);
      sourceRef.current = source; // Update the ref to the current source

      // Start visualization
      visualize();
    } else {
      stopPlayback();
    }

    return () => {
      stopPlayback();
    };
  }, [isPlaying, currentTime, duration, visualize]);

  // Set up resize observer for the container
  useEffect(() => {
    const container = canvasRef.current?.parentElement?.parentElement;
    if (!container) return;

    const updateDimensions = () => {
      const { width, height } = container.getBoundingClientRect();
      setDimensions({ width, height });
    };

    // Initial update
    updateDimensions();

    // Set up resize observer
    resizeObserverRef.current = new ResizeObserver(updateDimensions);
    resizeObserverRef.current.observe(container);

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, []);

  // Initialize audio on mount
  useEffect(() => {
    initAudio();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initAudio]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Initialize visualization on mount and when dimensions change
  useEffect(() => {
    if (canvasRef.current && analyserRef.current) {
      const animate = () => {
        visualize();
        if (isPlaying) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      if (isPlaying) {
        animate();
      } else {
        // Draw static visualization when not playing
        visualize();
      }

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [visualize, isPlaying]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        style={{
          opacity: isPlaying ? 0.9 : 0.6,
          transition: 'opacity 0.2s',
          borderRadius: '0.25rem',
        }}
        onClick={(e) => {
          // Optional: Add click handler to seek in the audio
          if (onSeek) {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            onSeek(pos * (duration || 0));
          }
        }}
      />
    </div>
  );
}
