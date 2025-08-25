import { useState } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface VideoGuideProps {
	src: string;
	poster: string;
	title: string;
	description: string;
	className?: string;
}

export function VideoGuide({
	src,
	poster,
	title,
	description,
	className = "",
}: VideoGuideProps) {
	const [isPlaying, setIsPlaying] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const [hasError, setHasError] = useState(false);

	// Check if the video is hosted on Google Drive
	const isGoogleDriveVideo = src.includes("drive.google.com");

	// Convert Google Drive share link to embed URL
	const getGoogleDriveEmbedUrl = (url: string) => {
		// Extract file ID from Google Drive URL
		const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
		if (fileIdMatch) {
			const fileId = fileIdMatch[1];
			return `https://drive.google.com/file/d/${fileId}/preview`;
		}
		return url;
	};

	const handlePlayPause = () => {
		if (isGoogleDriveVideo) {
			// For Google Drive videos, we can't control play/pause directly
			// The iframe handles its own controls
			return;
		}

		const video = document.querySelector(
			`video[src="${src}"]`
		) as HTMLVideoElement;
		if (video) {
			if (isPlaying) {
				video.pause();
			} else {
				video.play();
			}
			setIsPlaying(!isPlaying);
		}
	};

	const handleMuteToggle = () => {
		if (isGoogleDriveVideo) {
			// For Google Drive videos, we can't control mute directly
			return;
		}

		const video = document.querySelector(
			`video[src="${src}"]`
		) as HTMLVideoElement;
		if (video) {
			video.muted = !isMuted;
			setIsMuted(!isMuted);
		}
	};

	const handleVideoError = () => {
		setHasError(true);
	};

	const handleVideoLoad = () => {
		setHasError(false);
	};

	return (
		<div className={`space-y-3 ${className}`}>
			<h4 className="text-black font-medium text-sm">{title}</h4>

			{hasError ? (
				<div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
					<div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
						Video unavailable
					</div>
				</div>
			) : (
				<div className="relative w-full h-32 bg-gray-200 rounded-lg overflow-hidden group">
					{isGoogleDriveVideo ? (
						<iframe
							src={getGoogleDriveEmbedUrl(src)}
							className="w-full h-full border-0"
							allow="autoplay"
							title={title}
							onError={handleVideoError}
							onLoad={handleVideoLoad}
						/>
					) : (
						<video
							className="w-full h-full object-cover"
							controls
							preload="metadata"
							poster={poster}
							onError={handleVideoError}
							onLoadedData={handleVideoLoad}
							onPlay={() => setIsPlaying(true)}
							onPause={() => setIsPlaying(false)}
							onVolumeChange={(e) =>
								setIsMuted((e.target as HTMLVideoElement).muted)
							}
						>
							<source src={src} type="video/mp4" />
							<source src={src.replace(".mp4", ".webm")} type="video/webm" />
							Your browser does not support the video tag.
						</video>
					)}

					{/* Custom Controls Overlay - Only show for non-Google Drive videos */}
					{!isGoogleDriveVideo && (
						<div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 pointer-events-none">
							<div className="absolute bottom-2 left-2 flex items-center space-x-2 pointer-events-auto">
								<button
									onClick={handlePlayPause}
									className="p-2 bg-black bg-opacity-70 text-white rounded-full hover:bg-opacity-90 transition-all duration-200"
								>
									{isPlaying ? (
										<Pause className="h-3 w-3" />
									) : (
										<Play className="h-3 w-3" />
									)}
								</button>
								<button
									onClick={handleMuteToggle}
									className="p-2 bg-black bg-opacity-70 text-white rounded-full hover:bg-opacity-90 transition-all duration-200"
								>
									{isMuted ? (
										<VolumeX className="h-3 w-3" />
									) : (
										<Volume2 className="h-3 w-3" />
									)}
								</button>
							</div>
						</div>
					)}
				</div>
			)}

			<p className="text-gray-600 text-xs">{description}</p>
		</div>
	);
}
