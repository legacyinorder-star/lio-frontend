import { useEffect } from "react";

interface SEOProps {
	title: string;
	description: string;
	keywords?: string;
	ogTitle?: string;
	ogDescription?: string;
	ogImage?: string;
	ogUrl?: string;
	canonicalUrl?: string;
	schema?: object;
}

export function useSEO({
	title,
	description,
	keywords,
	ogTitle,
	ogDescription,
	ogImage,
	ogUrl,
	canonicalUrl,
	schema,
}: SEOProps) {
	useEffect(() => {
		// Set document title
		document.title = title;

		// Set or update meta description
		let metaDescription = document.querySelector('meta[name="description"]');
		if (!metaDescription) {
			metaDescription = document.createElement("meta");
			metaDescription.setAttribute("name", "description");
			document.head.appendChild(metaDescription);
		}
		metaDescription.setAttribute("content", description);

		// Set or update keywords
		if (keywords) {
			let metaKeywords = document.querySelector('meta[name="keywords"]');
			if (!metaKeywords) {
				metaKeywords = document.createElement("meta");
				metaKeywords.setAttribute("name", "keywords");
				document.head.appendChild(metaKeywords);
			}
			metaKeywords.setAttribute("content", keywords);
		}

		// Set Open Graph tags
		const setOGTag = (property: string, content: string) => {
			let meta = document.querySelector(`meta[property="${property}"]`);
			if (!meta) {
				meta = document.createElement("meta");
				meta.setAttribute("property", property);
				document.head.appendChild(meta);
			}
			meta.setAttribute("content", content);
		};

		if (ogTitle || title) setOGTag("og:title", ogTitle || title);
		if (ogDescription || description)
			setOGTag("og:description", ogDescription || description);
		if (ogImage) setOGTag("og:image", ogImage);
		if (ogUrl) setOGTag("og:url", ogUrl);

		// Set canonical URL
		if (canonicalUrl) {
			let canonical = document.querySelector('link[rel="canonical"]');
			if (!canonical) {
				canonical = document.createElement("link");
				canonical.setAttribute("rel", "canonical");
				document.head.appendChild(canonical);
			}
			canonical.setAttribute("href", canonicalUrl);
		}

		// Add JSON-LD schema
		if (schema) {
			// Remove existing schema script
			const existingSchema = document.querySelector(
				'script[type="application/ld+json"]'
			);
			if (existingSchema) {
				existingSchema.remove();
			}

			// Add new schema script
			const script = document.createElement("script");
			script.type = "application/ld+json";
			script.textContent = JSON.stringify(schema);
			document.head.appendChild(script);
		}
	}, [
		title,
		description,
		keywords,
		ogTitle,
		ogDescription,
		ogImage,
		ogUrl,
		canonicalUrl,
		schema,
	]);
}
