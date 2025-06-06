import Image from 'next/image';
import Link from 'next/link';
import { AudioPlayer } from '@/components/audio-player';
import { getAudioFiles } from '@/lib/data';
import { ArrowLeft, MusicIcon } from 'lucide-react';
import { notFound } from 'next/navigation';
import { AnimatedItem } from '@/components/animated-item';

export async function generateStaticParams() {
	return getAudioFiles().map((audio) => ({
		id: audio.id,
	}));
}

export default function AudioPage({ params }) {
	const audio = getAudioFiles().find((a) => a.id === params.id);

	if (!audio) {
		notFound();
	}

	// Ensure we have a fallback for the filename
	const displayFilename = audio.filename || audio.title || 'Audio File';

	return (
		<main className="min-h-screen bg-[#1a1a1a] text-white">
			<div className="container mx-auto px-4 py-12">
				<AnimatedItem>
					<Link href="/" className="inline-flex items-center mb-12 text-sm border border-[#333] px-4 py-2 rounded-full hover:bg-[#333] transition-colors">
						<ArrowLeft className="mr-2 h-4 w-4" />
						BACK
					</Link>
				</AnimatedItem>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					<AnimatedItem index={1}>
						<div className="relative aspect-square overflow-hidden border border-[#333]">
							{audio.thumbnail ? (
								<div className="relative w-full h-full">
									<div className="holographic-effect absolute inset-0 z-10"></div>
									<Image src={audio.thumbnail} alt={displayFilename} fill className="object-cover z-0" priority />
								</div>
							) : (
								<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#9370db] to-[#ffb6c1] opacity-70">
									<MusicIcon className="w-32 h-32 text-white/50" />
								</div>
							)}
						</div>
					</AnimatedItem>

					<div className="flex flex-col">
						<AnimatedItem index={2}>
							<div className="border-b border-[#333] pb-6 mb-6">
								<h1 className="text-5xl font-bold mb-2">{audio.title}</h1>
								<p className="text-white/70 mt-6">
								sdsd
									{displayFilename} • {audio.fileSize || 'N/A'}
								</p>
							</div>
						</AnimatedItem>

						<AnimatedItem index={3}>
							<AudioPlayer audioUrl={audio.audioUrl} />
						</AnimatedItem>
					</div>
				</div>
			</div>
		</main>
	);
}
