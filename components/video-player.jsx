'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Play, Loader } from 'lucide-react';
import { getMediaUrl } from '@/lib/media';

export function VideoPlayer({ video }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [hasUserInteracted, setHasUserInteracted] = useState(false);
    const [isSafari, setIsSafari] = useState(false);
    const videoRef = useRef(null);
    
    // Detect Safari browser
    useEffect(() => {
        const ua = window.navigator.userAgent;
        const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(ua) || 
                              /iPad|iPhone|iPod/.test(ua);
        setIsSafari(isSafariBrowser);
        console.log('Is Safari browser:', isSafariBrowser);
    }, []);

    // Handle user interaction tracking
    useEffect(() => {
        const handleUserInteraction = () => {
            if (!hasUserInteracted) {
                setHasUserInteracted(true);
            }
        };

        // Use capture phase to ensure our handler runs before other click handlers
        window.addEventListener('touchstart', handleUserInteraction, { once: true, capture: true });
        window.addEventListener('click', handleUserInteraction, { once: true, capture: true });

        return () => {
            window.removeEventListener('touchstart', handleUserInteraction, { capture: true });
            window.removeEventListener('click', handleUserInteraction, { capture: true });
        };
    }, [hasUserInteracted]);
    


    const videoUrl = getMediaUrl(video?.videoUrl);
    const videoSrc = videoUrl;
    
    // Safari-specific setup
    useEffect(() => {
        if (videoRef.current) {
            // Force metadata loading which can help Safari
            videoRef.current.load();
            
            // Add specific event listeners for Safari debugging
            const video = videoRef.current;
            const handleLoadedMetadata = () => {
                console.log('Video metadata loaded');
                setIsLoading(false);
            };
            
            video.addEventListener('loadedmetadata', handleLoadedMetadata);
            
            return () => {
                video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            };
        }
    }, [videoUrl]);

    const handleVideoClick = () => {
        if (!videoRef.current) return;

        // Set user interaction flag to true on any click
        setHasUserInteracted(true);
        
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            // Ensure video is unmuted when user explicitly clicks play
            videoRef.current.muted = false;
            
            // Direct synchronous play call is required by Safari and Android
            // Do not put this in a setTimeout
            const playPromise = videoRef.current.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('Playback started successfully');
                }).catch(error => {
                    console.error('Play error:', error);
                    // Fallback: show controls if play fails so user can manually try again
                    if (videoRef.current) {
                        videoRef.current.controls = true;
                    }
                });
            }
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Back button */}
            <div className="absolute top-8 left-8 z-50">
                <Link href="/" className="px-4 py-1 rounded-full border-2 border-black bg-white text-black font-bold text-2xl hover:bg-gray-100 transition-colors">
                    BACK
                </Link>
            </div>

            {/* Video container */}
            <div className="flex items-center justify-center min-h-screen">
                <div className="relative w-full" style={{ aspectRatio: '21/9' }}>
                    {/* Loading overlay */}
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                            <Loader className="w-10 h-10 text-black animate-spin" />
                        </div>
                    )}

                    <video
                        ref={videoRef}
                        className={`w-full h-full object-cover ${!isSafari ? '[&::-webkit-media-controls]:hidden [&::-webkit-media-controls-enclosure]:hidden [&::-webkit-media-controls-panel]:hidden' : ''}`}
                        onClick={handleVideoClick}
                        onPlay={() => {
                            console.log('Video play event');
                            setIsPlaying(true);
                        }}
                        onPause={() => {
                            console.log('Video pause event');
                            setIsPlaying(false);
                        }}
                        onEnded={() => setIsPlaying(false)}
                        onCanPlay={() => {
                            console.log('Video can play');
                            setIsLoading(false);
                            
                            // For Safari: try to play immediately when canplay fires if user has interacted
                            if (isSafari && hasUserInteracted && !isPlaying) {
                                console.log('Attempting Safari autoplay on canplay');
                                videoRef.current.play().catch(e => console.log('Autoplay on canplay failed:', e));
                            }
                        }}
                        onError={(e) => {
                            console.error('Video error:', e.target.error);
                            setIsLoading(false);
                            // Surface native controls so the user can retry manually
                            if (videoRef.current) {
                                videoRef.current.controls = true;
                            }
                        }}
                        preload="auto"
                        playsInline
                        webkit-playsinline="true"
                        x-webkit-airplay="allow"
                        muted={!hasUserInteracted}
                        autoPlay={false}
                        controls={false}
                        key={videoUrl}
                        aria-label={`Video: ${video.title || 'Video player'}`}
                    >
                        <source src={videoSrc} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>

                    {/* Custom play button overlay */}
                    {!isPlaying && !isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent event bubbling
                                    handleVideoClick();
                                }}
                                className="w-12 h-12 lg:w-20 lg:h-20 flex items-center justify-center bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
                            >
                                <Play className="w-6 h-6 lg:w-8 lg:h-8 text-black ml-1" />
                            </button>
                        </div>
                    )}

                    {/* Video label */}
                    <div className="absolute -bottom-10 right-3">
                        <span className="text-black font-bold text-md px-2 py-1">{video.filename}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
