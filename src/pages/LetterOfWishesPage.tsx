import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { useSEO } from "@/utils/useSEO";

export default function LetterOfWishesPage() {
	// SEO meta tags
	const baseUrl = window.location.origin;
	useSEO({
		title: "Letter of Wishes UK | Free Add-On with Your Will | Legacy In Order",
		description:
			"Get a free Letter of Wishes when you create your will. This complimentary add-on helps guide your loved ones with funeral preferences, personal messages, and digital assets. Available only with will purchase.",
		keywords:
			"letter of wishes UK, letter of wishes template, estate planning UK, guide executors wishes, free letter of wishes with will",
		ogTitle:
			"Letter of Wishes UK | Free Add-On with Your Will | Legacy In Order",
		ogDescription:
			"Get a free Letter of Wishes when you create your will. This complimentary add-on helps guide your loved ones. Available only with will purchase.",
		ogUrl: `${baseUrl}/letter-of-wishes`,
		canonicalUrl: `${baseUrl}/letter-of-wishes`,
	});
	const features = [
		"Complimentary for Will creators",
		"Guided letter creation",
		"Document saving",
		"Personal wishes and preferences",
		"Funeral and memorial instructions",
		"Family messages and guidance",
		"Easy updates and modifications",
		"Professional document format",
		"24/7 customer support",
		"Downloadable PDF format",
	];

	return (
		<div className="flex min-h-screen w-full flex-col">
			<Navbar />
			<main className="flex-1">
				{/* Hero Section */}
				<section className="w-full bg-white py-0 min-h-[500px] flex items-stretch overflow-hidden">
					<div className="w-full max-w-[2000px] mx-auto">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch min-h-[600px]">
							{/* Left Side - Content */}
							<div className="space-y-8 flex flex-col justify-center py-12 px-8 md:px-10 lg:px-12">
								<div className="space-y-4 pt-12">
									<h1 className="text-[4rem] font-semibold leading-tight text-[#173C37]">
										Letter of Wishes UK: Guide Your Loved Ones Clearly
									</h1>
									<p className="text-[1rem] font-normal leading-relaxed text-[#173C37]">
										Complement your will with a personal letter of wishes.
										Provide guidance on funeral preferences, personal messages
										and digital assets so your family knows exactly what you
										want. Available as a free add-on when you create your will
										with us.
									</p>
								</div>

								<div className="flex flex-col sm:flex-row gap-4">
									<Button
										variant="default"
										className="bg-[#173C37] text-white hover:bg-[#173C37]/90 font-semibold rounded px-[0.625rem] py-[1.4375rem] text-lg"
									>
										<Link to="/login">Create Your Will Now</Link>
									</Button>
								</div>
							</div>

							{/* Right Side - Image */}
							<div className="relative h-[600px] flex lg:ml-0 px-8 md:px-10 lg:px-0">
								<div className="relative w-full h-full overflow-hidden shadow-2xl flex">
									<img
										src="/images/LIO_new_img.jpg"
										alt="Family creating a letter of wishes together"
										className="w-full h-full object-cover"
										loading="eager"
										decoding="async"
									/>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* What is a Letter of Wishes Section */}
				<section
					className="w-full bg-[#FAFAF5] py-6 md:py-12 lg:py-24"
					id="features"
				>
					<div className="w-full max-w-[2000px] mx-auto px-4 md:px-6 lg:px-8">
						<div className="mx-auto flex max-w-full flex-col items-center space-y-4 text-center">
							<h2 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl mb-2">
								What Is a Letter of Wishes in the UK
							</h2>
							<p className="text-lg font-[500] text-muted-foreground mb-6 max-w-4xl">
								A Letter of Wishes is a personal document that accompanies your
								Will, providing guidance to your executors and loved ones about
								your personal preferences and wishes.
							</p>
							<p className="text-lg font-[500] text-muted-foreground mb-6 max-w-4xl">
								It is complimentary and automatically included when you purchase
								a will with us. Create your Will first to unlock access to your
								free Letter of Wishes.
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mx-auto">
							{/* Card 1 */}
							<div className="flex items-center bg-white p-8 rounded-xl shadow-sm">
								<div className="flex-shrink-0 mr-6">
									<img
										src="/svgs/without_4.svg"
										alt="Personal guidance for letter of wishes"
										className="w-12 h-12"
										loading="lazy"
										decoding="async"
									/>
								</div>
								<div className="flex-1">
									<h3 className="text-[1.25rem] font-semibold mb-4 mt-0 pt-0 text-[#173C37]">
										Personal Guidance
									</h3>
									<div className="text-secondary text-[1rem]">
										<p>Share your thoughts on:</p>
										<ul className="list-disc list-inside">
											<li>Funeral and memorial preferences</li>
											<li>Personal messages to family</li>
											<li>Special instructions for executors</li>
										</ul>
									</div>
								</div>
							</div>

							{/* Card 2 */}
							<div className="flex items-center bg-white p-8 rounded-xl shadow-sm">
								<div className="flex-shrink-0 mr-6">
									<img
										src="/svgs/heartbreak.svg"
										alt="Emotional support through letter of wishes"
										className="w-12 h-12"
										loading="lazy"
										decoding="async"
									/>
								</div>
								<div className="flex-1">
									<h3 className="text-[1.25rem] font-semibold mb-4 mt-0 pt-0 text-[#173C37]">
										Emotional Support
									</h3>
									<div className="text-secondary text-[1rem]">
										<p>Help your loved ones by:</p>
										<ul className="list-disc list-inside">
											<li>Explaining your decisions</li>
											<li>Providing comfort and closure</li>
											<li>Reducing family conflicts</li>
										</ul>
									</div>
								</div>
							</div>

							{/* Card 3 */}
							<div className="flex items-center bg-white p-8 rounded-xl shadow-sm">
								<div className="flex-shrink-0 mr-6">
									<img
										src="/svgs/without_3.svg"
										alt="Digital assets and personal wishes in letter of wishes"
										className="w-12 h-12"
										loading="lazy"
										decoding="async"
									/>
								</div>
								<div className="flex-1">
									<h3 className="text-[1.25rem] font-semibold mb-4 mt-0 pt-0 text-[#173C37]">
										Assets List
									</h3>
									<div className="text-secondary text-[1rem]">
										<p>Maintain an up-to-date list of your assets:</p>
										<ul className="list-disc list-inside">
											<li>Provide a detailed list of digital assets</li>
											<li>Instructions on access to digital assets</li>
											<li>Easier for executors to find what you own</li>
										</ul>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Call to Action Section with Background */}
				<section className="py-16 px-12">
					<div
						className="relative bg-cover bg-top bg-no-repeat rounded-[0.75rem] min-h-[400px] md:min-h-[500px] lg:min-h-[650px]"
						style={{
							backgroundImage: "url('/images/poa_2.jpg')",
						}}
					>
						{/* Dark overlay for better text readability */}
						<div className="absolute inset-0 bg-black/40 rounded-[0.75rem]"></div>

						{/* Content */}
						<div className="relative z-10 h-full flex items-center px-8 md:px-12 lg:px-16 pt-16 sm:pt-24 md:pt-32 lg:pt-40 xl:pt-48">
							<div className="max-w-2xl text-left">
								<h2 className="text-4xl md:text-5xl font-semibold text-white mb-6">
									How a Letter of Wishes Supports Your Will
								</h2>
								<p className="text-[1rem] font-medium text-white mb-16 leading-relaxed">
									Don't leave your family guessing. A Letter of Wishes provides
									clarity, comfort, and guidance when they need it most. Digital
									assets and personal wishes are clearly documented.
								</p>
								<div className="flex flex-col sm:flex-row gap-4">
									<Link to="/login">
										<Button className="w-full bg-white py-[0.75rem] px-[1.5rem] rounded-[0.25rem] text-[#173C37] hover:bg-gray-50 text-sm font-semibold">
											Create Your Will to Get Started
										</Button>
									</Link>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Pricing Section */}
				<div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-[#E2F3ED] mb-24">
					<div className="text-center mb-12">
						<h2 className="text-[3rem] text-[#173C37] font-semibold">
							Free Add-On with Every Will Purchase
						</h2>
						<p className="text-[1rem] font-medium text-black mb-16 leading-relaxed max-w-4xl mx-auto">
							When you purchase a Will with Legacy In Order, your Letter of
							Wishes is included at no extra cost. Create your Will first, and
							you'll automatically have access to create your complimentary
							Letter of Wishes. It is our way of helping you provide complete
							guidance to your loved ones.
						</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-1 gap-6 w-full max-w-lg mx-auto">
						{/* Letter of Wishes */}
						<Card className="relative bg-gray-50 flex flex-col border-2 border-teal">
							<CardHeader className="text-left pb-4">
								<CardTitle className="text-[1.25rem] font-medium text-black">
									Letter of Wishes
								</CardTitle>
								<div className="mt-2">
									<span className="text-[2.5rem] font-medium text-black">
										FREE
									</span>
								</div>
								<p className="text-sm font-normal text-black mt-1">
									Included free when you purchase a Will with Legacy In Order.
									Not available as a standalone service.
								</p>
							</CardHeader>
							<CardContent className="space-y-3 flex-1 flex flex-col p-4">
								<ul className="space-y-2 flex-1">
									{features.map((feature, index) => (
										<li key={index} className="flex items-start">
											<img
												src="/svgs/wills_page/dot.svg"
												alt="Feature marker"
												className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0"
												loading="lazy"
												decoding="async"
											/>
											<span className="text-[0.75rem] font-normal text-black">
												{feature}
											</span>
										</li>
									))}
								</ul>
								<Link to="/login">
									<Button className="w-full bg-[#173C37] hover:bg-[#173C37]/90 text-white mt-4 py-2 text-sm">
										Create Your Will Now
									</Button>
								</Link>
							</CardContent>
						</Card>
					</div>
				</div>

				<section className="w-full bg-transparent text-primary-foreground pb-12 md:pb-24 lg:pb-32">
					<div className="w-full max-w-[2000px] mx-auto px-4 md:px-6 lg:px-8">
						<div className="w-4/5 mx-auto bg-[#FAFAF5] rounded-[0.5rem] p-16">
							<div className="flex flex-col items-start justify-center space-y-6 text-left">
								<h2 className="text-[1.875rem] font-semibold text-[#173C37]">
									Ready to create your Will and letter of wishes?
								</h2>
								<p className="text-[1rem] font-normal text-[#173C37]">
									Start by creating your Will, and you'll automatically receive
									access to your free Letter of Wishes as a complimentary
									add-on.
								</p>
								<Link to="/login">
									<Button
										variant="default"
										className="bg-[#173C37] text-white hover:bg-[#173C37]/90 rounded px-[0.625rem] py-[1.5rem] text-lg"
									>
										Create Your Will Now
									</Button>
								</Link>
							</div>
						</div>
					</div>
				</section>
			</main>

			<Footer showCTA={false} />
		</div>
	);
}
