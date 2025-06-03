import { VideoPlayer } from '@/components/video-player';
import { VideoFiles } from '@/lib/data';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
	return VideoFiles.map((video) => ({
		id: video.id,
	}));
}

export default function VideoPage({ params }) {
	const { id } = params;
	const video = VideoFiles.find((v) => v.id === id);

	if (!video) {
		notFound();
	}

	return (
		<main className="min-h-screen bg-white">
			<VideoPlayer video={video} />
		</main>
	);
}
