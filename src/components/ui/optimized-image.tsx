import { useState } from "react";

interface OptimizedImageProps
	extends React.ImgHTMLAttributes<HTMLImageElement> {
	src: string;
	alt: string;
	webpSrc?: string;
	eager?: boolean; // Set to true for above-the-fold images
}

/**
 * Optimized image component with WebP support and lazy loading
 * Supports WebP format with fallback to original format
 */
export function OptimizedImage({
	src,
	alt,
	webpSrc,
	eager = false,
	className = "",
	...props
}: OptimizedImageProps) {
	const [webpError, setWebpError] = useState(false);

	// Generate WebP path if not provided
	const webpPath = webpSrc || src.replace(/\.(jpg|jpeg|png)$/i, ".webp");

	return (
		<picture>
			{/* WebP source with fallback */}
			{!webpError && (
				<source srcSet={webpPath} type="image/webp" />
			)}
			<img
				src={src}
				alt={alt}
				loading={eager ? "eager" : "lazy"}
				decoding="async"
				className={className}
				{...props}
				onError={(e) => {
					// If WebP fails, fall back to original
					if (!webpError) {
						setWebpError(true);
					}
					if (props.onError) props.onError(e);
				}}
			/>
		</picture>
	);
}

