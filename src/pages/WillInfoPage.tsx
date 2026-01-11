import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { useSEO } from "@/utils/useSEO";

export default function WillInfoPage() {
	// SEO meta tags and structured data
	const baseUrl = window.location.origin;
	useSEO({
		title: "Write a Will Online | England & Wales | Legacy In Order",
		description:
			"Write a legally binding will online with expert-reviewed templates. Simple, secure will writing for England and Wales.",
		keywords:
			"write a will online, online will UK, will writing service, legally binding will, make a will England and Wales",
		ogTitle: "Write a Will Online | England & Wales | Legacy In Order",
		ogDescription:
			"Write a legally binding will online with expert-reviewed templates. Simple, secure will writing for England and Wales.",
		ogUrl: `${baseUrl}/will-information`,
		canonicalUrl: `${baseUrl}/will-information`,
	});
	const features = [
		"Legally valid, customisable Will",
		"Complimentary Letter of Wishes",
		"Secure & encrypted data storage",
		"Unlimited beneficiaries and executors",
		"Easy updates and modifications",
		"Professional legal document format",
		"Downloadable PDF format",
	];

	return (
		<div className="flex min-h-screen w-full flex-col">
			<Navbar />
			<main className="flex-1">
				{/* Hero Section */}
				<section className="w-full bg-[#FAFAF5] py-0 min-h-[500px] flex items-stretch overflow-hidden">
					<div className="w-full max-w-[2000px] mx-auto">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch min-h-[500px]">
							{/* Left Side - Content */}
							<div className="space-y-8 flex flex-col justify-center py-12 px-8 md:px-10 lg:px-12">
								<div className="space-y-4 pt-12">
									<h1 className="text-[4rem] font-semibold leading-tight text-[#173C37]">
										Write a Will Online for England and Wales
									</h1>
									<p className="text-[1rem] font-normal leading-relaxed text-[#173C37]">
										Create a legally binding Will online in as little as 15
										minutes. Our expert-reviewed service meets UK legal
										requirements and gives you full control over who inherits
										your estate.
									</p>
								</div>

								<div className="flex flex-col sm:flex-row gap-4">
									<Button
										variant="default"
										className="bg-[#173C37] text-white hover:bg-[#173C37]/90 font-semibold rounded px-[0.625rem] py-[1.4375rem] text-lg"
									>
										<Link to="/login">Start Your Online Will</Link>
									</Button>
								</div>
							</div>

							{/* Right Side - Image with Text Overlay */}
							<div className="relative h-[600px] flex lg:ml-0 px-8 md:px-10 lg:px-0">
								<div className="relative w-full h-full overflow-hidden shadow-2xl flex">
									<img
										src="/images/poa_1.jpg"
										alt="Woman reviewing estate planning documents online"
										className="w-full h-full object-cover"
										loading="eager"
										decoding="async"
									/>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* No Will Section */}
				<section className="w-full bg-white py-12">
					<div className="w-full max-w-[2000px] mx-auto px-4 md:px-6 lg:px-8">
						<h2 className="text-[3rem] md:text-4xl font-semibold text-center text-[#173C37] pt-4 mb-18">
							Why Writing a Will Matters
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
							{/* Card 1 */}
							<div className="flex items-center bg-white rounded-[0.5rem] border border-mint-light p-6 max-w-md">
								<img
									src="/svgs/wills_page/need_1.svg"
									alt="Control who inherits your property and assets"
									className="w-16 h-16 mr-4 flex-shrink-0"
									loading="lazy"
									decoding="async"
								/>
								<div>
									<p className="text-[#173C37] text-base font-medium">
										Decide who inherits your property, money, and possessions.
									</p>
								</div>
							</div>
							{/* Card 2 */}
							<div className="flex items-center bg-white rounded-[0.5rem] border border-mint-light p-6 max-w-md">
								<img
									src="/svgs/wills_page/need_2.svg"
									alt="Appoint guardians for your children"
									className="w-16 h-16 mr-4 flex-shrink-0"
									loading="lazy"
									decoding="async"
								/>
								<div>
									<p className="text-[#173C37] text-base font-medium">
										Appoint guardians for your children.
									</p>
								</div>
							</div>
							{/* Card 3 */}
							<div className="flex items-center bg-white rounded-[0.5rem] border border-mint-light p-6 max-w-md">
								<img
									src="/svgs/wills_page/need_3.svg"
									alt="Leave specific bequests or charitable donations"
									className="w-16 h-16 mr-4 flex-shrink-0"
									loading="lazy"
									decoding="async"
								/>
								<div>
									<p className="text-[#173C37] text-base font-medium">
										Leave specific bequests or instructions.
									</p>
								</div>
							</div>
						</div>
						<div className="flex flex-col md:flex-row md:justify-center gap-4 mb-8">
							{/* Card 4 */}
							<div className="flex items-center bg-white rounded-[0.5rem] border border-mint-light p-6 max-w-md">
								<img
									src="/svgs/wills_page/need_4.svg"
									alt="Reduce stress and probate delays for loved ones"
									className="w-16 h-16 mr-4 flex-shrink-0"
									loading="lazy"
									decoding="async"
								/>
								<div>
									<p className="text-[#173C37] text-base font-medium">
										Reduce stress, delays, and costs for your loved ones.
									</p>
								</div>
							</div>
							{/* Card 5 */}
							<div className="flex items-center bg-white rounded-[0.5rem] border border-mint-light p-6 max-w-md">
								<img
									src="/svgs/wills_page/need_5.svg"
									alt="Prevent family disputes and legal complications"
									className="w-16 h-16 mr-4 flex-shrink-0"
									loading="lazy"
									decoding="async"
								/>
								<div>
									<p className="text-[#173C37] text-base font-medium">
										Prevent family disputes and legal complications.
									</p>
								</div>
							</div>
						</div>
						<p className="text-center text-[#173C37] text-[1rem] font-semibold mt-16 mb-6 max-w-xl mx-auto">
							Without a Will, the law decides who receives your estate — and it
							may not be who you would have chosen.
						</p>
					</div>
				</section>

				{/* How it works Section */}
				<section
					className="w-full bg-mint-alt py-6 md:py-12 lg:py-24"
					id="features"
				>
					<div className="w-full max-w-[2000px] mx-auto px-4 md:px-6 lg:px-8">
						<div className="mx-auto flex max-w-full flex-col items-center space-y-4 text-center">
							<h2 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl mb-2">
								How to Make a Will Online in 15 Minutes
							</h2>
							<p className="text-lg text-muted-foreground mb-6">
								Create your legally binding will online in as little as 15
								minutes
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-4">
							{/* Card 1 */}
							<div className="flex flex-col items-center text-center bg-white p-8 rounded-xl shadow-sm">
								<div className="w-12 h-12 flex items-center justify-center mb-6">
									<img
										src="/svgs/answer_1.svg"
										alt="Answer questions for your online will"
										className="w-12 h-12"
										loading="lazy"
										decoding="async"
									/>
								</div>
								<p className="text-sm text-gray-500 mb-2">Step 1</p>
								<h3 className="text-xl font-semibold mb-4 text-[#173C37]">
									Answer a few questions
								</h3>
								<p className="text-gray-600">
									No legal jargon, no stress. Just clear prompts tailored to
									your life and wishes.
								</p>
							</div>

							{/* Card 2 */}
							<div className="flex flex-col items-center text-center bg-white p-8 rounded-xl shadow-sm">
								<div className="w-12 h-12 flex items-center justify-center mb-6">
									<img
										src="/svgs/answer_2.svg"
										alt="Generate your legally binding will"
										className="w-12 h-12"
										loading="lazy"
										decoding="async"
									/>
								</div>
								<p className="text-sm text-gray-500 mb-2">Step 2</p>
								<h3 className="text-xl font-semibold mb-4 text-[#173C37]">
									Generate your document
								</h3>
								<p className="text-gray-600">
									Based on your answers, we will create a secure, legally valid
									Will.
								</p>
							</div>

							{/* Card 3 */}
							<div className="flex flex-col items-center text-center bg-white p-8 rounded-xl shadow-sm">
								<div className="w-12 h-12 flex items-center justify-center mb-6">
									<img
										src="/svgs/answer_3.svg"
										alt="Sign and register your online will"
										className="w-12 h-12"
										loading="lazy"
										decoding="async"
									/>
								</div>
								<p className="text-sm text-gray-500 mb-2">Step 3</p>
								<h3 className="text-xl font-semibold mb-4 text-[#173C37]">
									Sign & Witness
								</h3>
								<p className="text-gray-600">
									Print your Will and sign it in front of two witnesses to make
									it legally valid.
								</p>
							</div>

							{/* Card 4 */}
							<div className="flex flex-col items-center text-center bg-white p-8 rounded-xl shadow-sm">
								<div className="w-12 h-12 flex items-center justify-center mb-6">
									<img
										src="/svgs/answer_4.svg"
										alt="Secure storage for your will"
										className="w-12 h-12"
										loading="lazy"
										decoding="async"
									/>
								</div>
								<p className="text-sm text-gray-500 mb-2">Step 4</p>
								<h3 className="text-xl font-semibold mb-4 text-[#173C37]">
									Store Securely
								</h3>
								<p className="text-gray-600">
									Store your Will securely, with a physical copy and a secure
									digital version.
								</p>
							</div>
						</div>
						<div className="flex flex-col sm:flex-row justify-center gap-4 mt-12">
							<Button
								variant="default"
								className="text-white bg-[#173C37] rounded border border-[#173C37] font-semibold px-8 py-6 hover:bg-[#173C37]/90"
							>
								<Link to="/signup">Write my Will</Link>
							</Button>
							<Button
								variant="outline"
								className="text-[#173C37] border border-[#173C37] font-semibold rounded hover:bg-[#173C37] hover:text-white px-8 py-6"
							>
								Explore the Vault
							</Button>
						</div>
					</div>
				</section>

				{/* Pricing Section */}
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-gray-900">
							What Is Included in Our Online Will Service
						</h2>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-1 gap-6 w-full max-w-lg mx-auto">
						{/* Single Will */}
						<Card className="relative bg-gray-50 border-2 border-teal flex flex-col">
							<CardHeader className="text-left pb-8">
								<CardTitle className="text-[1.65rem] font-medium text-black">
									Will Creation
								</CardTitle>
								<div className="mt-4">
									<span className="text-[3.375rem] font-medium text-black">
										£100
									</span>
								</div>
								<p className="text-base font-normal text-black mt-2">
									Create a legally binding Will with professional guidance
								</p>
							</CardHeader>
							<CardContent className="space-y-4 flex-1 flex flex-col">
								<ul className="space-y-3 flex-1">
									{features.map((feature, index) => (
										<li key={index} className="flex items-start">
											<img
												src="/svgs/wills_page/dot.svg"
												alt="Feature marker"
												className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0"
												loading="lazy"
												decoding="async"
											/>
											<span className="text-[0.8rem] font-normal text-black">
												{feature}
											</span>
										</li>
									))}
								</ul>
								<Link to="/signup">
									<Button className="w-full bg-[#173C37] hover:bg-[#173C37]/90 text-white mt-8">
										Create My Will Online
									</Button>
								</Link>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Features Section */}
				<div className="bg-[#E2F3ED] py-16 mb-24">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center mb-12">
							<h2 className="text-[3rem] font-semibold text-[#173C37]">
								Secure Storage for Your Will
							</h2>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							{/* Card 1 */}
							<div
								className="p-8 flex flex-col items-center justify-center"
								style={{
									borderRadius: "0.5rem",
									border: "1px solid #F5F5F5",
									background: "#FFF",
									boxShadow: "0px 2px 12px 0px rgba(0, 0, 0, 0.10)",
								}}
							>
								<img
									src="/images/box_vault.png"
									alt="Physical secure vault box for documents"
									className="w-48 h-48 object-contain mb-6"
									loading="lazy"
									decoding="async"
								/>
								<h3 className="text-xl font-semibold text-black mb-3 text-center">
									Home Vault Box
								</h3>
								<p className="text-gray-600 text-center max-w-sm">
									A waterproof and fire-resistant physical storage box for your
									essential documents.
								</p>
								<Button
									disabled
									className="w-[300px] bg-white border border-[#173C37] text-[#173C37] hover:bg-gray-50 mt-6 cursor-not-allowed"
								>
									Coming soon
								</Button>
							</div>

							{/* Card 2 */}
							<div
								className="p-8 flex flex-col items-center justify-center"
								style={{
									borderRadius: "0.5rem",
									border: "1px solid #F5F5F5",
									background: "#FFF",
									boxShadow: "0px 2px 12px 0px rgba(0, 0, 0, 0.10)",
								}}
							>
								<img
									src="/images/weather-cloud.png"
									alt="Digital secure vault for online will storage"
									className="w-48 h-48 object-contain mb-6"
									loading="lazy"
									decoding="async"
								/>
								<h3 className="text-xl font-semibold text-black mb-3 text-center">
									Digital Vault
								</h3>
								<p className="text-gray-600 text-center max-w-sm">
									Upload and store your will and other legacy documents securely
									online.
								</p>
								<Button
									disabled
									className="w-[300px] bg-white border border-[#173C37] text-[#173C37] hover:bg-gray-50 mt-6 cursor-not-allowed"
								>
									Coming soon
								</Button>
							</div>
						</div>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
}
