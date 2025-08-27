import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";

export default function PricingPage() {
	const willFeatures = [
		"Guided will creation",
		"Document saving",
		"Basic customer support",
		"One document type",
		"Easy updates and modifications",
		"Professional legal document format",
		"24/7 customer support",
		"Downloadable PDF format",
		"Plans for up to 4 family members",
		"Shared vault and documents",
		"Family permissions and sharing",
	];

	const letterFeatures = [
		"Complimentary for will creators",
		"Guided letter creation",
		"Document saving",
		"Personal wishes and preferences",
		"Funeral and memorial instructions",
		"Family messages and guidance",
		"Digital and printable format",
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
										Simple, Transparent Pricing
									</h1>
									<p className="text-[1rem] font-normal leading-relaxed text-[#173C37]">
										Choose the plan that's right for you and your family's
										legacy planning needs
									</p>
								</div>

								<div className="flex flex-col sm:flex-row gap-4">
									<Button
										variant="default"
										className="bg-[#173C37] text-white hover:bg-[#173C37]/90 font-semibold rounded px-[0.625rem] py-[1.4375rem] text-lg"
									>
										<Link to="/login">Get Started</Link>
									</Button>
								</div>
							</div>

							{/* Right Side - Image */}
							<div className="relative h-full min-h-[500px] flex lg:ml-0 px-8 md:px-10 lg:px-0">
								<div className="relative w-full h-full overflow-hidden shadow-2xl flex">
									<img
										src="/images/poa_1.jpg"
										alt="Pricing and Plans"
										className="w-full h-full object-cover"
									/>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Pricing Section */}
				<div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-[#E2F3ED] mb-24">
					<div className="text-center mb-12">
						<h2 className="text-[3rem] text-[#173C37] font-semibold">
							Choose Your Plan
						</h2>
						<p className="text-[1rem] font-medium text-black mb-16 leading-relaxed max-w-4xl mx-auto">
							We offer flexible pricing options to meet your legacy planning
							needs. All plans include professional guidance and support.
						</p>
					</div>
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
						{/* Will */}
						<Card
							className="relative bg-gray-50 border-2 border-teal flex flex-col"
							style={{
								boxShadow: "0px 1.656px 9.938px 0px rgba(0, 0, 0, 0.10)",
							}}
						>
							<CardHeader className="text-left pb-4">
								<CardTitle className="text-[1.25rem] font-medium text-black">
									Will Creation
								</CardTitle>
								<div className="mt-2">
									<span className="text-[2.5rem] font-medium text-black">
										£99
									</span>
								</div>
								<p className="text-sm font-normal text-black mt-1">
									Create a legally binding will with professional guidance.
								</p>
							</CardHeader>
							<CardContent className="space-y-3 flex-1 flex flex-col p-4">
								<ul className="space-y-2 flex-1">
									{willFeatures.slice(0, 8).map((feature, index) => (
										<li key={index} className="flex items-start">
											<img
												src="/svgs/wills_page/dot.svg"
												alt="Feature marker"
												className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0"
											/>
											<span className="text-[0.75rem] font-normal text-black">
												{feature}
											</span>
										</li>
									))}
								</ul>
								<Link to="/login">
									<Button className="w-full bg-[#173C37] hover:bg-[#173C37]/90 text-white mt-4 py-2 text-sm">
										Create My Will
									</Button>
								</Link>
							</CardContent>
						</Card>

						{/* Letter of Wishes */}
						<Card className="relative bg-gray-50 flex flex-col">
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
									Complimentary for will creators.
								</p>
							</CardHeader>
							<CardContent className="space-y-3 flex-1 flex flex-col p-4">
								<ul className="space-y-2 flex-1">
									{letterFeatures.slice(0, 8).map((feature, index) => (
										<li key={index} className="flex items-start">
											<img
												src="/svgs/wills_page/dot.svg"
												alt="Feature marker"
												className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0"
											/>
											<span className="text-[0.75rem] font-normal text-black">
												{feature}
											</span>
										</li>
									))}
								</ul>
								<Link to="/login">
									<Button className="w-full bg-white border border-[#173C37] text-[#173C37] hover:bg-gray-50 mt-4 py-2 text-sm">
										Create My Letter of Wishes
									</Button>
								</Link>
							</CardContent>
						</Card>
					</div>
				</div>
			</main>

			<Footer showCTA={false} />
		</div>
	);
}
