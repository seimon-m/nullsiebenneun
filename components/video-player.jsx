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
    const videoRef = useRef(null);

    // Get the video URL
	const getVideoUrl = () => {
		if (!video?.videoUrl) return '';
		const filename = video.videoUrl.split('/').pop().trim();
		return `https://${CLOUDFRONT_DOMAIN}/${filename.replace(/ /g, '+')}`;
	};

    const videoUrl = getVideoUrl();

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
                        onCanPlay={() => setIsLoading(false)}
                        onError={(e) => {
                            console.error('Video error:', e);
                            console.error('Video error details:', e.target.error);
                            // Fallback to S3 direct URL if CloudFront fails
                            if (videoRef.current && !videoRef.current.src.includes('s3.amazonaws.com')) {
                                const s3Url = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/videos/${encodeURIComponent(video.videoUrl.split('/').pop().trim())}`;
                                videoRef.current.src = s3Url;
                            }
                        }}
                        preload="metadata"
                        playsInline
                        crossOrigin="anonymous"
                        key={videoUrl}
                        aria-label={`Video: ${video.title || 'Video player'}`}
                    >
                        <source
                            src={videoUrl}
                            type="video/mp4"
                            onError={(e) => {
                                console.error('Source error:', e);
                                // Try with unencoded spaces if encoded URL fails
                                if (e.target.src.includes('s3')) {
                                    const filename = video.videoUrl.split('/').pop().trim();
                                    const unencodedUrl = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/videos/${filename.replace(/ /g, '+')}`;
                                    console.log('Trying with unencoded spaces:', unencodedUrl);
                                    e.target.src = unencodedUrl;
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
