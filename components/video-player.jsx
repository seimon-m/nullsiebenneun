'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Play, Loader } from 'lucide-react';

// CloudFront Configuration
const CLOUDFRONT_DOMAIN = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN;
const S3_BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;
const S3_REGION = process.env.NEXT_PUBLIC_AWS_REGION;

export function VideoPlayer({ video }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [hasUserInteracted, setHasUserInteracted] = useState(false);
    const videoRef = useRef(null);

    // Handle user interaction for iOS Safari
    useEffect(() => {
        const handleUserInteraction = () => {
            if (!hasUserInteracted) {
                setHasUserInteracted(true);
                // Try to play video when user first interacts
                if (videoRef.current) {
                    videoRef.current.play().catch(e => console.log('Initial play attempt:', e));
                }
            }
        };

        window.addEventListener('touchstart', handleUserInteraction, { once: true });
        window.addEventListener('click', handleUserInteraction, { once: true });

        return () => {
            window.removeEventListener('touchstart', handleUserInteraction);
            window.removeEventListener('click', handleUserInteraction);
        };
    }, [hasUserInteracted]);

    // Get the video URL with proper encoding
    const getVideoUrl = () => {
        if (!video?.videoUrl) return '';
        const filename = video.videoUrl.split('/').pop().trim();
        // Properly encode the filename but keep forward slashes
        const encodedFilename = encodeURIComponent(filename).replace(/%2F/g, '/');
        return `https://${CLOUDFRONT_DOMAIN}/${encodedFilename}`;
    };

    const videoUrl = getVideoUrl();

    // Add a timestamp to prevent caching issues
    const cacheBuster = Date.now();
    const videoSrc = `${videoUrl}?t=${cacheBuster}`;

    const handleVideoClick = () => {
        if (!videoRef.current) return;

        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play().catch(error => {
                console.error('Error playing video:', error);
            });
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
                        className="w-full h-full object-cover [&::-webkit-media-controls]:hidden [&::-webkit-media-controls-enclosure]:hidden [&::-webkit-media-controls-panel]:hidden"
                        onClick={handleVideoClick}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => setIsPlaying(false)}
                        onCanPlay={() => {
                            console.log('Video can play');
                            setIsLoading(false);
                        }}
                        onError={(e) => {
                            console.error('Video error:', e);
                            console.error('Video error details:', e.target.error);

                            // Try to get more detailed error information
                            const video = e.target;
                            console.log('Video network state:', video.networkState);
                            console.log('Video ready state:', video.readyState);

                            // Fallback to S3 direct URL if CloudFront fails
                            if (!video.src.includes('s3.amazonaws.com')) {
                                const filename = video.videoUrl.split('/').pop().trim();
                                const s3Url = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/videos/${encodeURIComponent(filename)}`;
                                console.log('Falling back to S3 URL:', s3Url);
                                video.src = s3Url;
                                video.load(); // Force reload with new source
                                video.play().catch(e => console.error('Error playing fallback:', e));
                            }
                        }}
                        preload="auto"
                        playsInline
                        webkit-playsinline="true"
                        x-webkit-airplay="allow"
                        crossOrigin="anonymous"
                        muted
                        key={videoUrl}
                        aria-label={`Video: ${video.title || 'Video player'}`}
                    >
                        <source
                            src={`${videoSrc}?X-Amz-Expires=86400&X-Amz-Date=${new Date().toISOString().replace(/[:.-]/g, '')}`}
                            type="video/mp4"
                            onError={(e) => {
                                console.error('Source error:', e);
                                console.error('Source element:', e.target);

                                // Try with unencoded spaces if encoded URL fails
                                if (e.target.src.includes(CLOUDFRONT_DOMAIN)) {
                                    const filename = video.videoUrl.split('/').pop().trim();
                                    const unencodedUrl = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/videos/${filename.replace(/ /g, '+')}`;
                                    console.log('Trying with S3 URL (unencoded spaces):', unencodedUrl);

                                    // If we have a video element reference, update it directly
                                    if (videoRef.current) {
                                        videoRef.current.src = unencodedUrl;
                                        videoRef.current.load();
                                        videoRef.current.play().catch(err => console.error('Error playing S3 fallback:', err));
                                    }
                                }
                            }}
                        />
                        Your browser does not support the video tag.
                    </video>

                    {/* Custom play button overlay */}
                    {!isPlaying && !isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <button
                                onClick={handleVideoClick}
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
