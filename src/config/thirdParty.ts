/**
 * Third-party script configuration (loaded only after cookie consent).
 * Set in .env — see .env.example.
 */
export const gaMeasurementId: string =
	import.meta.env.VITE_GA_MEASUREMENT_ID ?? "";

export const tawkEmbedSrc: string = import.meta.env.VITE_TAWK_EMBED_SRC ?? "";

export const clarityProjectId: string =
	import.meta.env.VITE_CLARITY_PROJECT_ID ?? "";
