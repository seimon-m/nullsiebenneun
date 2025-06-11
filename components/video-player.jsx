'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Play, Loader } from 'lucide-react';

export function VideoPlayer({ video }) {
	const [isPlaying, setIsPlaying] = useState(false);
	const [showControls, setShowControls] = useState(true);
	const [isLoading, setIsLoading] = useState(true);
	const videoRef = useRef(null);

	useEffect(() => {
		const videoElement = videoRef.current;
		if (!videoElement) return;

		const handleCanPlay = () => {
			setIsLoading(false);
		};

		videoElement.addEventListener('canplay', handleCanPlay);

		// Start preloading
		videoElement.load();

		return () => {
			videoElement.removeEventListener('canplay', handleCanPlay);
		};
	}, []);

	const togglePlay = () => {
		if (!videoRef.current || isLoading) return;

		if (isPlaying) {
			videoRef.current.pause();
		} else {
			videoRef.current.play();
		}
		setIsPlaying(!isPlaying);
	};

	const handleVideoClick = () => {
		if (isLoading) return;

		togglePlay();
		setShowControls(true);

		// Hide controls after 3 seconds
		setTimeout(() => {
			setShowControls(false);
		}, 3000);
	};

	return (
		<div className="min-h-screen bg-white">
			{/* Back button */}
			<div className="absolute top-8 left-8 z-50">
				<Link href="/" className="px-4 py-1 rounded-full border-2 border-black bg-white text-black font-bold text-2xl hover:bg-gray-100 transition-colors">
					BACK
				</Link>
			</div>

			{/* Video container with 21:9 aspect ratio */}
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
						className="w-full h-full object-cover"
						onClick={handleVideoClick}
						onPlay={() => setIsPlaying(true)}
						onPause={() => setIsPlaying(false)}
						preload="auto"
					>
						<source src={video.videoUrl} type="video/mp4" />
						Your browser does not support the video tag.
					</video>

					{/* Play button overlay */}
					{!isPlaying && showControls && !isLoading && (
						<div className="absolute inset-0 flex items-center justify-center">
							<button onClick={togglePlay} className="w-12 h-12 lg:w-20 lg:h-20 flex items-center justify-center bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all">
								<Play className="w-6 h-6 lg:w-8 lg:h-8 text-black ml-1" />
							</button>
						</div>
					)}

					{/* Video label */}
					<div className="m-4 flex justify-end">
						<span className="text-black font-bold text-lg  px-3 py-1">{video.filename}</span>
					</div>
				</div>
			</div>
		</div>
	);
}
