'use client';

import { useState } from 'react';
import { Navigation } from '@/components/navigation';
import { AudioPlayer } from '@/components/audio-player';
import { getAudioFiles } from '@/lib/data';

export default function AudioPage() {
	const audioFiles = getAudioFiles();
	const [playingId, setPlayingId] = useState(null);

	const handlePlay = (id) => {
		setPlayingId(id === playingId ? null : id);
	};

	return (
		<main className="min-h-screen bg-white">
			<div className="pt-8">
				<Navigation activeSection="audio" />
				<div className="pt-8 px-4">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{audioFiles.map((audio) => (
							<AudioPlayer key={audio.id} audio={audio} isPlaying={audio.id === playingId} onPlayPause={() => handlePlay(audio.id)} />
						))}
					</div>
				</div>
			</div>
		</main>
	);
}
