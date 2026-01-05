import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { useSEO } from "@/utils/useSEO";

export default function HomePage() {
	const { user } = useAuth();

	// SEO meta tags and structured data
	const baseUrl = window.location.origin;
	useSEO({
		title: "Online Will Writing Service UK | Legacy In Order",
		description:
			"Create a legally valid will online in minutes. Secure, affordable will writing for England and Wales. Start today.",
		keywords:
			"online will UK, will writing service UK, make a will online, legally valid will, England and Wales will",
		ogTitle: "Online Will Writing Service UK | Legacy In Order",
		ogDescription:
			"Create a legally valid will online in minutes. Secure, affordable will writing for England and Wales.",
		ogUrl: `${baseUrl}/`,
		canonicalUrl: `${baseUrl}/`,
		schema: {
			"@context": "https://schema.org",
			"@type": "LegalService",
			name: "Legacy In Order",
			description:
				"Online will writing service for England and Wales. Create legally valid wills and estate planning documents.",
			url: baseUrl,
			serviceType: "Online Will Writing",
			areaServed: {
				"@type": "Country",
				name: "United Kingdom",
			},
			provider: {
				"@type": "Organization",
				name: "Legacy In Order",
				url: baseUrl,
				address: {
					"@type": "PostalAddress",
					streetAddress: "128 City Road",
					addressLocality: "London",
					postalCode: "EC1V 2NX",
					addressCountry: "GB",
				},
			},
		},
	});

	// Carousel images
	const carouselImages = [
		"/images/pixs/pix10.jpeg",
		"/images/header1.jpg",
		"/images/product_1.jpg",
		"/images/pixs/pix15.jpeg",
		"/images/LIO_new_img.jpg",
		"/images/pixs/pix1.jpeg",
		"/images/pixs/pix2.jpeg",
		"/images/pixs/pix11.jpeg",
		"/images/pixs/pix3.jpeg",
		"/images/pixs/pix12.jpeg",
		"/images/pixs/pix4.jpeg",
		"/images/pixs/pix5.jpeg",
		"/images/pixs/pix13.jpeg",
		"/images/pixs/pix6.jpeg",
		"/images/pixs/pix9.jpeg",
	];

	const [currentImageIndex, setCurrentImageIndex] = useState(0);

	// Auto-rotate carousel every 4 seconds
	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentImageIndex(
				(prevIndex) => (prevIndex + 1) % carouselImages.length
			);
		}, 4000);

		return () => clearInterval(interval);
	}, [carouselImages.length]);

	return (
		<div className="flex min-h-screen w-full flex-col">
			<Navbar />
			<main className="flex-1">
				{/* Hero Section */}
				<section className="w-full bg-[#DFF2EB] py-0 min-h-[500px] flex items-stretch overflow-hidden">
					<div className="w-full max-w-[2000px] mx-auto">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch min-h-[500px]">
							{/* Left Side - Content */}
							<div className="space-y-8 flex flex-col justify-center py-12 px-8 md:px-10 lg:px-12">
								<div className="space-y-4 pt-12">
									<h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight text-[#173C37]">
										Online Will Writing Made Simple (England and Wales)
									</h1>
									<p className="text-[1rem] font-normal leading-relaxed text-[#173C37]">
										Create a legally valid will online in under 15 minutes with
										our expert-reviewed service. Designed for people in England
										and Wales seeking an affordable, secure and user-friendly
										way to protect their legacy.
									</p>
								</div>

								<div className="flex flex-col sm:flex-row gap-4">
									<Button
										variant="default"
										className="bg-[#173C37] text-white hover:bg-[#173C37]/90 font-semibold rounded p-[1.5rem] text-lg"
									>
										<Link to={user ? "/dashboard" : "/login"}>
											Start Your Online Will
										</Link>
									</Button>
								</div>
							</div>

							{/* Right Side - Image Carousel with Text Overlay */}
							<div className="relative h-[600px] flex lg:ml-0 px-8 md:px-10 lg:px-0">
								<div className="relative w-full h-full overflow-hidden shadow-2xl flex">
									{carouselImages.map((image, index) => (
										<img
											key={index}
											src={image}
											alt={
												index === currentImageIndex
													? "Family creating an online will together"
													: ""
											}
											loading={index === 0 ? "eager" : "lazy"}
											decoding="async"
											className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
												index === currentImageIndex
													? "opacity-100"
													: "opacity-0"
											}`}
										/>
									))}
									<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8 z-10">
										<p className="text-white text-xl md:text-2xl font-normal leading-relaxed">
											Let us help you create a legacy. Start the conversation
											today and take the first step toward peace of mind.
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Features Section */}
				<section
					className="w-full bg-[#FAFAF5] py-6 md:py-12 lg:py-24"
					id="features"
				>
					<div className="w-full max-w-[2000px] mx-auto px-4 md:px-6 lg:px-8">
						<div className="mx-auto flex max-w-full flex-col items-center space-y-4 text-center">
							<h2 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl mb-2">
								How Our Online Will Writing Service Works
							</h2>
							<p className="text-lg text-muted-foreground mb-6">
								Create your legally valid will online in as little as 15 minutes
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-4">
							{/* Card 1 */}
							<div className="flex flex-col items-center text-center bg-white p-8 rounded-xl shadow-sm">
								<div className="w-16 h-16 flex items-center justify-center mb-6">
									<img
										src="/svgs/answer_1.svg"
										alt="Answer questions for online will"
										className="w-16 h-16"
										loading="lazy"
										decoding="async"
									/>
								</div>
								<h3 className="text-xl font-semibold mb-4 text-[#173C37]">
									1. Answer a few questions
								</h3>
								<p className="text-gray-600">
									No legal jargon, no stress. Just clear prompts tailored to
									your life and wishes.
								</p>
							</div>

							{/* Card 2 */}
							<div className="flex flex-col items-center text-center bg-white p-8 rounded-xl shadow-sm">
								<div className="w-16 h-16 flex items-center justify-center mb-6">
									<img
										src="/svgs/answer_2.svg"
										alt="Generate legally valid will document"
										className="w-16 h-16"
										loading="lazy"
										decoding="async"
									/>
								</div>
								<h3 className="text-xl font-semibold mb-4 text-[#173C37]">
									2. Generate your document
								</h3>
								<p className="text-gray-600">
									Based on your answers, we create secure, legally valid
									documents like Wills or Power of Attorney.
								</p>
							</div>

							{/* Card 3 */}
							<div className="flex flex-col items-center text-center bg-white p-8 rounded-xl shadow-sm">
								<div className="w-16 h-16 flex items-center justify-center mb-6">
									<img
										src="/svgs/answer_3.svg"
										alt="Sign and register your will"
										className="w-16 h-16"
										loading="lazy"
										decoding="async"
									/>
								</div>
								<h3 className="text-xl font-semibold mb-4 text-[#173C37]">
									3. Sign & Register
								</h3>
								<p className="text-gray-600">
									Store your documents in your private vault . Revisit, edit, or
									share with loved ones anytime.
								</p>
							</div>

							{/* Card 4 */}
							<div className="flex flex-col items-center text-center bg-white p-8 rounded-xl shadow-sm">
								<div className="w-16 h-16 flex items-center justify-center mb-6">
									<img
										src="/svgs/answer_4.svg"
										alt="Secure storage for estate planning documents"
										className="w-16 h-16"
										loading="lazy"
										decoding="async"
									/>
								</div>
								<h3 className="text-xl font-semibold mb-4 text-[#173C37]">
									4. Store Securely
								</h3>
								<p className="text-gray-600">
									Make changes on your schedule, from any device, whether you're
									at your desk or on the move.
								</p>
							</div>
						</div>
						<div className="flex flex-col sm:flex-row justify-center gap-4 mt-12 mb-8">
							<Button
								variant="default"
								className="text-white bg-[#173C37] rounded border border-[#173C37] font-semibold px-8 py-6 hover:bg-[#173C37]/90"
							>
								<Link to={user ? "/dashboard" : "/login"}>
									Start Your Online Will
								</Link>
							</Button>
							{/* <Button
								variant="outline"
								className="text-[#173C37] border border-[#173C37] font-semibold rounded hover:bg-[#173C37] hover:text-white px-8 py-6"
							>
								Explore the Vault
							</Button> */}
						</div>
					</div>
				</section>

				{/* No Will Section */}
				<section className="w-full bg-white pt-12 pb-4">
					<div className="w-full max-w-[2000px] mx-auto px-4 md:px-6 lg:px-8">
						<h2 className="text-[3rem] md:text-4xl font-semibold text-center text-[#173C37] pt-4 mb-18">
							What Happens If You Die Without a Will in England and Wales
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
							{/* Card 1 */}
							<div
								className="flex items-center bg-white rounded-[0.5rem] border-[#EAEAEA] p-6 max-w-md"
								style={{
									boxShadow: "0px 2px 12px 0px rgba(0, 0, 0, 0.05)",
								}}
							>
								<img
									src="/svgs/without_1.svg"
									alt="The law decides who inherits your assets without a will"
									className="w-16 h-16 mr-4 flex-shrink-0"
									loading="lazy"
									decoding="async"
								/>
								<div>
									<h3 className="text-[1.25rem] font-semibold text-[#173C37] mb-2">
										The law decides who inherits your assets
									</h3>
									<p className="text-gray-700">
										Your assets may not go to the people you would have chosen.
									</p>
								</div>
							</div>
							{/* Card 2 */}
							<div
								className="flex items-center bg-white rounded-[0.5rem] border-[#EAEAEA] p-6 max-w-md"
								style={{
									boxShadow: "0px 2px 12px 0px rgba(0, 0, 0, 0.05)",
								}}
							>
								<img
									src="/svgs/without_2.svg"
									alt="Unmarried partners have no automatic inheritance rights"
									className="w-16 h-16 mr-4 flex-shrink-0"
									loading="lazy"
									decoding="async"
								/>
								<div>
									<h3 className="text-lg font-semibold text-[#173C37] mb-2">
										Unmarried partners have no automatic rights
									</h3>
									<p className="text-gray-700">
										Even long-term partners may receive nothing.
									</p>
								</div>
							</div>
							{/* Card 3 */}
							<div
								className="flex items-center bg-white rounded-[0.5rem] border-[#EAEAEA] p-6 max-w-md"
								style={{
									boxShadow: "0px 2px 12px 0px rgba(0, 0, 0, 0.05)",
								}}
							>
								<img
									src="/svgs/without_3.svg"
									alt="Probate delays and legal costs increase without a will"
									className="w-16 h-16 mr-4 flex-shrink-0"
									loading="lazy"
									decoding="async"
								/>
								<div>
									<h3 className="text-lg font-semibold text-[#173C37] mb-2">
										Delays and legal costs increase
									</h3>
									<p className="text-gray-700">
										It can take months or years before loved ones receive
										anything.
									</p>
								</div>
							</div>
						</div>
						{/* Second row with flexbox for centering */}
						<div className="flex flex-col md:flex-row md:justify-center gap-4 mb-8">
							{/* Card 4 */}
							<div
								className="flex items-center bg-white rounded-[0.5rem] border-[#EAEAEA] p-6 max-w-md"
								style={{
									boxShadow: "0px 2px 12px 0px rgba(0, 0, 0, 0.05)",
								}}
							>
								<img
									src="/svgs/without_4.svg"
									alt="Minor children may not be fully protected without a will"
									className="w-16 h-16 mr-4 flex-shrink-0"
									loading="lazy"
									decoding="async"
								/>
								<div>
									<h3 className="text-lg font-semibold text-[#173C37] mb-2">
										Minor children may not be fully protected
									</h3>
									<p className="text-gray-700">
										The courts may appoint guardians without your input.
									</p>
								</div>
							</div>
							{/* Card 5 */}
							<div
								className="flex items-center bg-white rounded-[0.5rem] border-[#EAEAEA] p-6 max-w-md"
								style={{
									boxShadow: "0px 2px 12px 0px rgba(0, 0, 0, 0.05)",
								}}
							>
								<img
									src="/svgs/without_5.svg"
									alt="Family disputes and legal battles can result without a will"
									className="w-16 h-16 mr-4 flex-shrink-0"
									loading="lazy"
									decoding="async"
								/>
								<div>
									<h3 className="text-lg font-semibold text-[#173C37] mb-2">
										Lack of a Will often leads to family disagreements
									</h3>
									<p className="text-gray-700">
										Unclear wishes can lead to family disagreements and even
										legal battles over your estate.
									</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Video Section */}
				<section className="w-full bg-white py-12">
					<div className="w-full px-4 md:px-6 lg:px-8">
						<video
							className="w-full rounded-[1.5rem] shadow-lg mb-16"
							style={{ aspectRatio: "16/9", display: "none" }}
							controls
							preload="metadata"
						>
							<source src="/videos/video_1.mp4" type="video/mp4" />
							Your browser does not support the video tag.
						</video>

						<div className="mt-4 text-center max-w-4xl mx-auto">
							<h2 className="text-[1.5rem] md:text-4xl lg:text-5xl font-semibold text-black mb-6">
								The Good News – Create Your Will Online Today
							</h2>
							<p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
								Creating a will with Legacy In Order is simple, secure, and
								affordable. Our online will writing service lets you draft, sign
								and store your will from home in as little as 15 minutes. Start
								today and give your family peace of mind.
							</p>
							<Button
								variant="default"
								className="bg-[#173C37] text-white hover:bg-[#173C37]/90 font-semibold rounded px-[1.625rem] py-[2.4375rem] text-lg"
							>
								<Link to="/login">Start Your Online Will</Link>
							</Button>
						</div>
					</div>
				</section>

				{/* Life is Easier Section */}
				<section className="w-full bg-[#FAFAF5] py-12">
					<div className="w-full max-w-[2000px] mx-auto px-4 md:px-6 lg:px-8">
						<h2 className="text-[3rem] font-semibold text-center text-[#173C37] mb-16">
							Secure, Legally Valid Wills Reviewed by Experts
						</h2>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
							{/* Row 1 */}
							<div className="text-left">
								<img
									src="/svgs/easier_1.svg"
									alt="Experienced legal team reviewing online wills"
									className="w-16 h-16 mb-4"
									loading="lazy"
									decoding="async"
								/>
								<h3 className="text-[1.5rem] font-semibold text-[#173C37] mb-2">
									An Experienced Legal Team
								</h3>
								<p className="text-[1rem] text-[#173C37] leading-relaxed">
									Our trusted legal experts bring decades of experience,
									ensuring every step of the process is simple, secure, and
									tailored to your needs
								</p>
							</div>

							<div className="text-left">
								<img
									src="/svgs/easier_2.svg"
									alt="Secure digital storage for wills and estate documents"
									className="w-16 h-16 mb-4"
									loading="lazy"
									decoding="async"
								/>
								<h3 className="text-[1.5rem] font-semibold text-[#173C37] mb-2">
									Secure Storage and Accessibility
								</h3>
								<p className="text-[1rem] text-[#173C37] leading-relaxed">
									Your documents are safeguarded with enterprise-grade
									encryption, giving you complete peace of mind while ensuring
									you, and only you, can access them whenever needed.
								</p>
							</div>

							{/* Row 2 */}
							<div className="text-left">
								<img
									src="/svgs/easier_3.svg"
									alt="Professionally reviewed will documents"
									className="w-16 h-16 mb-4"
									loading="lazy"
									decoding="async"
								/>
								<h3 className="text-[1.5rem] font-semibold text-[#173C37] mb-2">
									Professionally Reviewed Documents
								</h3>
								<p className="text-[1rem] text-[#173C37] leading-relaxed">
									Every template is designed and checked against best practice
									standards, so you can be confident your documents are
									accurate, reliable, and legally sound.
								</p>
							</div>

							<div className="text-left">
								<img
									src="/svgs/easier_4.svg"
									alt="Affordable online will writing service"
									className="w-16 h-16 mb-4"
									loading="lazy"
									decoding="async"
								/>
								<h3 className="text-[1.5rem] font-semibold text-[#173C37] mb-2">
									Clear, Affordable, and Transparent
								</h3>
								<p className="text-[1rem] text-[#173C37] leading-relaxed">
									No hidden costs. No complicated legal jargon. Just a
									straightforward, affordable way to protect your future and
									your loved ones.
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* New Section */}
				<section className="w-full bg-[#239485] pt-12 pb-24">
					<div className="w-full max-w-[2000px] mx-auto px-4 md:px-6 lg:px-8">
						<div className="text-center">
							<h2 className="mt-[3rem] text-[3rem] font-semibold text-white mb-6">
								Join The Community of People Who Trust LegacyInOrder
							</h2>

							{/* Review Cards */}
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
								{/* Card 1 */}
								<div className="bg-white rounded-lg p-6 shadow-lg text-left flex flex-col h-full">
									<div className="flex gap-1 mb-4">
										{[...Array(5)].map((_, i) => (
											<svg
												key={i}
												className="w-5 h-5 text-[#8E8E56]"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
											</svg>
										))}
									</div>
									<p className="text-gray-700 text-sm mb-4 leading-relaxed flex-grow">
										LegacyInOrder made the entire process so simple. I was able
										to create my Will in under 15 minutes and feel completely
										confident about my family's future.
									</p>
									<div className="flex items-center gap-3 mt-auto">
										<img
											src="/avatars/user1.png"
											alt="Sarah J. reviewing her online will"
											className="w-10 h-10 rounded-full"
											loading="lazy"
											decoding="async"
										/>
										<div>
											<h4 className="font-semibold text-gray-900 text-sm">
												Sarah J.
											</h4>
											<p className="text-gray-600 text-xs">Business Owner</p>
										</div>
									</div>
								</div>

								{/* Card 2 */}
								<div className="bg-white rounded-lg p-6 shadow-lg text-left flex flex-col h-full">
									<div className="flex gap-1 mb-4">
										{[...Array(5)].map((_, i) => (
											<svg
												key={i}
												className="w-5 h-5 text-[#8E8E56]"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
											</svg>
										))}
									</div>
									<p className="text-gray-700 text-sm mb-4 leading-relaxed flex-grow">
										The security features give me peace of mind. I can update my
										documents anytime and know they're protected with
										enterprise-grade encryption.
									</p>
									<div className="flex items-center gap-3 mt-auto">
										<img
											src="/avatars/user2.png"
											alt="Michael C. securing his estate documents"
											className="w-10 h-10 rounded-full"
											loading="lazy"
											decoding="async"
										/>
										<div>
											<h4 className="font-semibold text-gray-900 text-sm">
												Michael C.
											</h4>
											<p className="text-gray-600 text-xs">Software Engineer</p>
										</div>
									</div>
								</div>

								{/* Card 3 */}
								<div className="bg-white rounded-lg p-6 shadow-lg text-left flex flex-col h-full">
									<div className="flex gap-1 mb-4">
										{[...Array(5)].map((_, i) => (
											<svg
												key={i}
												className="w-5 h-5 text-[#8E8E56]"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
											</svg>
										))}
									</div>
									<p className="text-gray-700 text-sm mb-4 leading-relaxed flex-grow">
										As a healthcare professional, I've seen how important proper
										planning is. LegacyInOrder makes it accessible to everyone
										with their expert-reviewed templates.
									</p>
									<div className="flex items-center gap-3 mt-auto">
										<img
											src="/avatars/user3.png"
											alt="Priyanka R. using online will writing service"
											className="w-10 h-10 rounded-full"
											loading="lazy"
											decoding="async"
										/>
										<div>
											<h4 className="font-semibold text-gray-900 text-sm">
												Priyanka R.
											</h4>
											<p className="text-gray-600 text-xs">
												Healthcare Professional
											</p>
										</div>
									</div>
								</div>

								{/* Card 4 */}
								<div className="bg-white rounded-lg p-6 shadow-lg text-left flex flex-col h-full">
									<div className="flex gap-1 mb-4">
										{[...Array(5)].map((_, i) => (
											<svg
												key={i}
												className="w-5 h-5 text-[#8E8E56]"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
											</svg>
										))}
									</div>
									<p className="text-gray-700 text-sm mb-4 leading-relaxed flex-grow">
										No hidden fees or expensive lawyer consultations. Just a
										straightforward, affordable way to protect my family's
										future. Highly recommend!
									</p>
									<div className="flex items-center gap-3 mt-auto">
										<img
											src="/avatars/user4.png"
											alt="Christina T. recommending online will service"
											className="w-10 h-10 rounded-full"
											loading="lazy"
											decoding="async"
										/>
										<div>
											<h4 className="font-semibold text-gray-900 text-sm">
												Christina T.
											</h4>
											<p className="text-gray-600 text-xs">Retired Teacher</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* FAQ Section */}
				<section id="faq" className="w-full bg-white py-12">
					<div className="w-full max-w-[2000px] mx-auto px-4 md:px-6 lg:px-8">
						<h2 className="text-[3rem] font-semibold text-center text-[#173C37] mb-16">
							Frequently Asked Questions
						</h2>
						<div className="max-w-4xl mx-auto space-y-0">
							<div className="border rounded-lg bg-[#FAFAFA]">
								<button
									className="w-full px-[35px] py-[35px] text-left flex justify-between items-center"
									onClick={() => {
										const content = document.getElementById("faq1-content");
										const icon = document.getElementById("faq1-icon");
										// Close all other accordions
										["faq2-content", "faq3-content", "faq4-content"].forEach(
											(id) => {
												const otherContent = document.getElementById(id);
												const otherIcon = document.getElementById(
													id.replace("content", "icon")
												);
												if (otherContent && otherIcon) {
													otherContent.classList.add("hidden");
													otherIcon.textContent = "+";
												}
											}
										);
										if (content && icon) {
											content.classList.toggle("hidden");
											icon.textContent = content.classList.contains("hidden")
												? "+"
												: "-";
										}
									}}
								>
									<span className="text-[1.25rem] font-semibold text-[#173C37] font-['Hedvig_Letters_Serif']">
										What documents can I create with LegacyInOrder?
									</span>
									<span id="faq1-icon" className="text-[3rem] font-light">
										+
									</span>
								</button>
								<div
									id="faq1-content"
									className="hidden px-[35px] py-[35px] bg-white"
								>
									<p className="text-[1rem] font-normal text-[#545454] font-['DM_Sans']">
										You can create legally binding Wills and letters of wishes
										with our{" "}
										<Link
											to="/will-information"
											className="text-[#239485] underline hover:text-[#173C37]"
										>
											online will writing service
										</Link>
										. Our platform guides you through each document creation
										process with clear, step-by-step instructions.
									</p>
								</div>
							</div>

							<div className="border rounded-lg bg-[#FAFAFA]">
								<button
									className="w-full px-[35px] py-[35px] text-left flex justify-between items-center"
									onClick={() => {
										const content = document.getElementById("faq2-content");
										const icon = document.getElementById("faq2-icon");
										// Close all other accordions
										["faq1-content", "faq3-content", "faq4-content"].forEach(
											(id) => {
												const otherContent = document.getElementById(id);
												const otherIcon = document.getElementById(
													id.replace("content", "icon")
												);
												if (otherContent && otherIcon) {
													otherContent.classList.add("hidden");
													otherIcon.textContent = "+";
												}
											}
										);
										if (content && icon) {
											content.classList.toggle("hidden");
											icon.textContent = content.classList.contains("hidden")
												? "+"
												: "-";
										}
									}}
								>
									<span className="text-[1.25rem] font-semibold text-[#173C37] font-['Hedvig_Letters_Serif']">
										How secure is my information?
									</span>
									<span id="faq2-icon" className="text-[3rem] font-light">
										+
									</span>
								</button>
								<div
									id="faq2-content"
									className="hidden px-[35px] py-[35px] bg-white"
								>
									<p className="text-[1rem] font-normal text-[#545454] font-['DM_Sans']">
										We use enterprise-grade encryption to protect your data. All
										documents are stored securely and can only be accessed by
										you. We never share your information with third parties
										without your explicit consent. Our privacy policy explains
										how we handle your data.
									</p>
								</div>
							</div>

							<div className="border rounded-lg bg-[#FAFAFA]">
								<button
									className="w-full px-[35px] py-[35px] text-left flex justify-between items-center"
									onClick={() => {
										const content = document.getElementById("faq3-content");
										const icon = document.getElementById("faq3-icon");
										// Close all other accordions
										["faq1-content", "faq2-content", "faq4-content"].forEach(
											(id) => {
												const otherContent = document.getElementById(id);
												const otherIcon = document.getElementById(
													id.replace("content", "icon")
												);
												if (otherContent && otherIcon) {
													otherContent.classList.add("hidden");
													otherIcon.textContent = "+";
												}
											}
										);
										if (content && icon) {
											content.classList.toggle("hidden");
											icon.textContent = content.classList.contains("hidden")
												? "+"
												: "-";
										}
									}}
								>
									<span className="text-[1.25rem] font-semibold text-[#173C37] font-['Hedvig_Letters_Serif']">
										Can I update my documents later?
									</span>
									<span id="faq3-icon" className="text-[3rem] font-light">
										+
									</span>
								</button>
								<div
									id="faq3-content"
									className="hidden px-[35px] py-[35px] bg-white"
								>
									<p className="text-[1rem] font-normal text-[#545454] font-['DM_Sans']">
										Yes, you can update your documents at any time. We recommend
										reviewing and updating your documents annually or when
										significant life changes occur. All updates are tracked and
										versioned for your reference.
									</p>
								</div>
							</div>

							<div className="border rounded-lg bg-[#FAFAFA]">
								<button
									className="w-full px-[35px] py-[35px] text-left flex justify-between items-center"
									onClick={() => {
										const content = document.getElementById("faq4-content");
										const icon = document.getElementById("faq4-icon");
										// Close all other accordions
										["faq1-content", "faq2-content", "faq3-content"].forEach(
											(id) => {
												const otherContent = document.getElementById(id);
												const otherIcon = document.getElementById(
													id.replace("content", "icon")
												);
												if (otherContent && otherIcon) {
													otherContent.classList.add("hidden");
													otherIcon.textContent = "+";
												}
											}
										);
										if (content && icon) {
											content.classList.toggle("hidden");
											icon.textContent = content.classList.contains("hidden")
												? "+"
												: "-";
										}
									}}
								>
									<span className="text-[1.25rem] font-semibold text-[#173C37] font-['Hedvig_Letters_Serif']">
										Do I need a lawyer to use LegacyInOrder?
									</span>
									<span id="faq4-icon" className="text-[3rem] font-light">
										+
									</span>
								</button>
								<div
									id="faq4-content"
									className="hidden px-[35px] py-[35px] bg-white"
								>
									<p className="text-[1rem] font-normal text-[#545454] font-['DM_Sans']">
										While our documents are legally sound and reviewed by
										experts, we recommend consulting with a lawyer for complex
										situations or if you have specific legal concerns. Our
										platform is designed to be user-friendly while maintaining
										legal validity.
									</p>
								</div>
							</div>
						</div>
					</div>
				</section>
			</main>

			<Footer />
		</div>
	);
}
