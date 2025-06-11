"use client"

import { useRef, useEffect, useCallback, useState } from 'react';

// Constants for better performance
const BAR_COUNT = 24;
const BAR_WIDTH = 6;
const BAR_SPACING = 2;
const MAX_BAR_HEIGHT_RATIO = 0.8;
const FFT_SIZE = 64;
const FRAME_RATE = 30; // Target FPS
const FRAME_DELAY = 1000 / FRAME_RATE;

export function WaveformVisualizer({ audioUrl, isPlaying, currentTime, duration }) {
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationRef = useRef(null);
  const lastFrameTime = useRef(0);
  const dataArrayRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isContextInitialized, setIsContextInitialized] = useState(false);
  const [isBufferReady, setIsBufferReady] = useState(false);
  const abortControllerRef = useRef(null);
  const resizeObserverRef = useRef(null);

  // Initialize audio context and analyzer
  const initAudio = useCallback(async () => {
    // Abort any ongoing initialization
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // Clean up any existing audio context first
      if (audioContextRef.current?.state !== 'closed') {
        try {
          await audioContextRef.current?.close();
        } catch (e) {
          console.warn('Error closing previous audio context:', e);
        }
      }

      setIsContextInitialized(false);
      setIsBufferReady(false);

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      
      // Create analyzer node with optimized settings
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = FFT_SIZE;
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);

      // Set up audio source if we have a URL
      if (audioUrl && !abortController.signal.aborted) {
        const response = await fetch(audioUrl, { signal: abortController.signal });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

        if (abortController.signal.aborted) return;

        // Create new source node
        sourceRef.current = audioContextRef.current.createBufferSource();
        sourceRef.current.buffer = audioBuffer;
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
        
        setIsBufferReady(true);
      }
      
      setIsContextInitialized(true);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Audio initialization aborted');
        return;
      }
      console.error("Error initializing audio:", error);
      // Clean up on error
      try {
        await audioContextRef.current?.close();
      } catch (e) {
        console.warn('Error cleaning up after error:', e);
      }
      audioContextRef.current = null;
      analyserRef.current = null;
      sourceRef.current = null;
      dataArrayRef.current = null;
      setIsContextInitialized(false);
      setIsBufferReady(false);
    } finally {
      if (abortController === abortControllerRef.current) {
        abortControllerRef.current = null;
      }
    }
  }, [audioUrl]);

  // Stop any ongoing animation and clean up resources
  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  // Clean up all audio resources
  const cleanup = useCallback(async () => {
    stopAnimation();
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    try {
      if (sourceRef.current) {
        try {
          sourceRef.current.stop();
          sourceRef.current.disconnect();
        } catch (e) {
          // Ignore errors when stopping already stopped source
        }
        sourceRef.current = null;
      }
      
      if (analyserRef.current) {
        analyserRef.current.disconnect();
        analyserRef.current = null;
      }
      
      if (audioContextRef.current?.state !== 'closed') {
        await audioContextRef.current?.close();
      }
      audioContextRef.current = null;
      
      dataArrayRef.current = null;
    } catch (error) {
      console.warn('Error during cleanup:', error);
    }
    
    setIsContextInitialized(false);
    setIsBufferReady(false);
  }, [stopAnimation]);

  // Draw waveform on canvas
  const drawWaveform = useCallback((ctx, width, height, dataArray) => {
    if (!ctx || width <= 0 || height <= 0) return;

    // Clear canvas with a transparent background
    ctx.clearRect(0, 0, width, height);
    
    const barTotalWidth = BAR_WIDTH + BAR_SPACING;
    const halfHeight = height / 2;
    const maxBarHeight = height * MAX_BAR_HEIGHT_RATIO;
    const bufferLength = dataArray?.length || 0;
    const segmentSize = Math.max(1, Math.floor(bufferLength / BAR_COUNT));
    
    // Save the current context state
    ctx.save();
    
    // Set styles
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;
    
    // Draw progress indicator background (full width, semi-transparent)
    if (duration > 0) {
      const progress = Math.min(Math.max(0, (currentTime % (duration || 1)) / (duration || 1)), 1);
      const progressX = width * progress;
      
      // Draw the background for the progress (the part that's already played)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, progressX, height);
      
      // Draw the remaining part (not yet played)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(progressX, 0, width - progressX, height);
    }
    
    // Draw all bars
    for (let i = 0; i < BAR_COUNT; i++) {
      let sum = 0;
      const start = i * segmentSize;
      const end = Math.min(start + segmentSize, bufferLength);
      const segmentLength = end - start;
      
      if (segmentLength > 0 && dataArray) {
        for (let j = 0; j < segmentLength; j++) {
          sum += dataArray[start + j] || 0;
        }
        
        const average = sum / segmentLength;
        const barHeight = Math.max(2, (average / 255) * maxBarHeight);
        const x = i * barTotalWidth + BAR_SPACING / 2;
        const y = halfHeight - (barHeight / 2);

        // Create gradient for the bar
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, '#4f46e5'); // Indigo-600
        gradient.addColorStop(1, '#6366f1'); // Indigo-500
        
        // Draw the bar
        ctx.fillStyle = gradient;
        
        // Draw rounded rectangle
        const radius = Math.min(BAR_WIDTH / 2, 4);
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + BAR_WIDTH - radius, y);
        ctx.quadraticCurveTo(x + BAR_WIDTH, y, x + BAR_WIDTH, y + radius);
        ctx.lineTo(x + BAR_WIDTH, y + barHeight - radius);
        ctx.quadraticCurveTo(x + BAR_WIDTH, y + barHeight, x + BAR_WIDTH - radius, y + barHeight);
        ctx.lineTo(x + radius, y + barHeight);
        ctx.quadraticCurveTo(x, y + barHeight, x, y + barHeight - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
      }
    }
    
    // Restore the context state (removes shadow and other styles)
    ctx.restore();
  }, [currentTime, duration]);

  // Throttled visualization update
  const visualize = useCallback((timestamp = 0) => {
    if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) return;

    const { width, height } = dimensions;
    
    // Only proceed if we have valid dimensions
    if (width <= 0 || height <= 0) {
      animationRef.current = requestAnimationFrame(visualize);
      return;
    }

    // Throttle frame rate to improve performance
    const now = timestamp || performance.now();
    const delta = now - (lastFrameTime.current || 0);
    
    if (delta < FRAME_DELAY) {
      // Skip this frame to maintain target FPS
      animationRef.current = requestAnimationFrame(visualize);
      return;
    }
    lastFrameTime.current = now - (delta % FRAME_DELAY);

    // Update canvas dimensions only when they change
    const dpr = window.devicePixelRatio || 1;
    const targetWidth = Math.floor(width * dpr);
    const targetHeight = Math.floor(height * dpr);
    
    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    }

    try {
      // Get frequency data
      if (isPlaying && analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      } else if (dataArrayRef.current) {
        // Create a simple static pattern when not playing
        const time = now * 0.001;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          dataArrayRef.current[i] = Math.sin(time * 2 + i * 0.1) * 50 + 50;
        }
      }
      
      // Draw the waveform if we have data
      if (dataArrayRef.current) {
        drawWaveform(ctx, width, height, dataArrayRef.current);
      }
    } catch (error) {
      console.warn('Error in visualization loop:', error);
      stopAnimation();
      return;
    }
    
    // Continue the animation loop
    animationRef.current = requestAnimationFrame(visualize);
  }, [dimensions, isPlaying, drawWaveform, stopAnimation]);

  // Handle play/pause state and audio source management
  useEffect(() => {
    if (!isContextInitialized || !analyserRef.current) return;

    let source = null;

    const handlePlayback = async () => {
      if (isPlaying) {
        // Resume audio context if suspended
        if (audioContextRef.current?.state === 'suspended') {
          try {
            await audioContextRef.current.resume();
          } catch (error) {
            console.error('Error resuming audio context:', error);
            return;
          }
        }
        // Start visualization
        if (!animationRef.current) {
          lastFrameTime.current = 0;
          animationRef.current = requestAnimationFrame(visualize);
        }
      } else {
        // Pause visualization
        stopAnimation();
      }
    };

    handlePlayback();

    return () => {
      stopAnimation();
      if (source) {
        try {
          source.stop();
          source.disconnect();
        } catch (e) {
          // Ignore errors when stopping already stopped source
        }
      }
    };
  }, [isPlaying, isContextInitialized, visualize, stopAnimation]);

  // Initialize audio when component mounts or audioUrl changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      initAudio();
    }

    return () => {
      cleanup();
    };
  }, [audioUrl, initAudio, cleanup]);

  // Handle window resize with debounce and ResizeObserver
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (canvasRef.current) {
          const { width, height } = canvasRef.current.getBoundingClientRect();
          setDimensions({
            width: Math.floor(width),
            height: Math.floor(height)
          });
        }
      }, 100);
    };

    // Initial size
    handleResize();

    // Set up ResizeObserver for container
    const container = canvasRef.current?.parentElement;
    if (container && 'ResizeObserver' in window) {
      resizeObserverRef.current = new ResizeObserver(handleResize);
      resizeObserverRef.current.observe(container);
    } else {
      // Fallback to window resize event
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      } else {
        window.removeEventListener('resize', handleResize);
      }
      clearTimeout(resizeTimeout);
    };
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanup();
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [cleanup]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          display: 'block',
          backgroundColor: 'transparent',
          transition: 'opacity 0.3s ease',
          opacity: isContextInitialized ? 1 : 0.5
        }}
      />
      {!isContextInitialized && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          Loading audio...
        </div>
      )}
    </div>
  );
}
