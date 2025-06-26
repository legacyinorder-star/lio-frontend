import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";

export default function PricingPage() {
	const features = [
		"Legally valid will that meets your state's requirements",
		"Secure & encrypted data storage",
		"Lifetime access to your will",
		"Unlimited beneficiaries and executors",
		"Easy updates and modifications",
		"Professional legal document format",
		"24/7 customer support",
		"Downloadable PDF format",
	];

	const testimonials = [
		{
			name: "Sarah Johnson",
			role: "Business Owner",
			content:
				"Creating my will was so much easier than I expected. The process was clear and professional.",
			rating: 5,
		},
		{
			name: "Michael Chen",
			role: "Family Man",
			content:
				"Peace of mind knowing my family is protected. The service was excellent from start to finish.",
			rating: 5,
		},
		{
			name: "Emily Rodriguez",
			role: "Retiree",
			content:
				"Simple, secure, and affordable. I recommend this to everyone who needs a will.",
			rating: 5,
		},
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
										Write a will that’s tailored to you.
									</h1>
									<p className="text-[1rem] font-normal leading-relaxed text-[#173C37]">
										LegacyInOrder simplifies and secures your most important
										personal and legal documents, giving you full control and
										peace of mind.
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

							{/* Right Side - Image with Text Overlay */}
							<div className="relative h-full min-h-[500px] flex lg:ml-0 px-8 md:px-10 lg:px-0">
								<div className="relative w-full h-full overflow-hidden shadow-2xl flex">
									<img
										src="/images/will_page.png"
										alt="Legacy Planning"
										className="w-full h-full object-cover"
									/>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Pricing Section */}
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						{/* Basic Plan */}
						<Card className="relative border-2 border-gray-200">
							<CardHeader className="text-center pb-8">
								<CardTitle className="text-2xl font-bold text-gray-900">
									Basic Will
								</CardTitle>
								<div className="mt-4">
									<span className="text-4xl font-bold text-gray-900">$99</span>
									<span className="text-gray-600 ml-2">one-time</span>
								</div>
								<p className="text-gray-600 mt-2">
									Perfect for simple estate planning
								</p>
							</CardHeader>
							<CardContent className="space-y-4">
								<ul className="space-y-3">
									{features.slice(0, 4).map((feature, index) => (
										<li key={index} className="flex items-start">
											<Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
											<span className="text-gray-700">{feature}</span>
										</li>
									))}
								</ul>
								<Button className="w-full bg-gray-600 hover:bg-gray-700 text-white mt-8">
									Get Started
								</Button>
							</CardContent>
						</Card>

						{/* Premium Plan - Featured */}
						<Card className="relative border-2 border-light-green transform scale-105 shadow-xl">
							<div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
								<span className="bg-light-green text-black px-4 py-2 rounded-full text-sm font-semibold">
									Most Popular
								</span>
							</div>
							<CardHeader className="text-center pb-8">
								<CardTitle className="text-2xl font-bold text-gray-900">
									Complete Will Package
								</CardTitle>
								<div className="mt-4">
									<span className="text-4xl font-bold text-gray-900">$99</span>
									<span className="text-gray-600 ml-2">one-time</span>
								</div>
								<p className="text-gray-600 mt-2">
									Everything you need for comprehensive estate planning
								</p>
							</CardHeader>
							<CardContent className="space-y-4">
								<ul className="space-y-3">
									{features.map((feature, index) => (
										<li key={index} className="flex items-start">
											<Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
											<span className="text-gray-700">{feature}</span>
										</li>
									))}
								</ul>
								<Link to="/app/payment/checkout?description=Will Creation Service">
									<Button className="w-full bg-light-green hover:bg-light-green/90 text-black mt-8">
										Get Started Now
									</Button>
								</Link>
							</CardContent>
						</Card>

						{/* Premium Plus Plan */}
						<Card className="relative border-2 border-gray-200">
							<CardHeader className="text-center pb-8">
								<CardTitle className="text-2xl font-bold text-gray-900">
									Premium Plus
								</CardTitle>
								<div className="mt-4">
									<span className="text-4xl font-bold text-gray-900">$149</span>
									<span className="text-gray-600 ml-2">one-time</span>
								</div>
								<p className="text-gray-600 mt-2">
									Advanced features for complex estates
								</p>
							</CardHeader>
							<CardContent className="space-y-4">
								<ul className="space-y-3">
									{features.map((feature, index) => (
										<li key={index} className="flex items-start">
											<Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
											<span className="text-gray-700">{feature}</span>
										</li>
									))}
								</ul>
								<li className="flex items-start">
									<Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
									<span className="text-gray-700">Priority legal review</span>
								</li>
								<li className="flex items-start">
									<Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
									<span className="text-gray-700">Phone consultation</span>
								</li>
								<Button className="w-full bg-gray-600 hover:bg-gray-700 text-white mt-8">
									Get Started
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Features Section */}
				<div className="bg-white py-16">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center mb-12">
							<h2 className="text-3xl font-bold text-gray-900">
								Why Choose Legacy In Order?
							</h2>
							<p className="mt-4 text-lg text-gray-600">
								We make estate planning simple, secure, and accessible
							</p>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
							<div className="text-center">
								<div className="w-16 h-16 bg-light-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
									<Check className="h-8 w-8 text-light-green" />
								</div>
								<h3 className="text-lg font-semibold text-gray-900 mb-2">
									Legally Valid
								</h3>
								<p className="text-gray-600">
									All documents meet your state's legal requirements
								</p>
							</div>
							<div className="text-center">
								<div className="w-16 h-16 bg-light-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
									<Star className="h-8 w-8 text-light-green" />
								</div>
								<h3 className="text-lg font-semibold text-gray-900 mb-2">
									Secure & Private
								</h3>
								<p className="text-gray-600">
									Bank-level encryption protects your sensitive information
								</p>
							</div>
							<div className="text-center">
								<div className="w-16 h-16 bg-light-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
									<Check className="h-8 w-8 text-light-green" />
								</div>
								<h3 className="text-lg font-semibold text-gray-900 mb-2">
									Easy to Use
								</h3>
								<p className="text-gray-600">
									Simple step-by-step process, no legal jargon
								</p>
							</div>
							<div className="text-center">
								<div className="w-16 h-16 bg-light-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
									<Star className="h-8 w-8 text-light-green" />
								</div>
								<h3 className="text-lg font-semibold text-gray-900 mb-2">
									Lifetime Access
								</h3>
								<p className="text-gray-600">
									Update your will anytime, anywhere
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Testimonials Section */}
				<div className="bg-gray-50 py-16">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center mb-12">
							<h2 className="text-3xl font-bold text-gray-900">
								What Our Customers Say
							</h2>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
							{testimonials.map((testimonial, index) => (
								<Card key={index} className="bg-white">
									<CardContent className="p-6">
										<div className="flex items-center mb-4">
											{Array.from({ length: testimonial.rating }).map(
												(_, i) => (
													<Star
														key={i}
														className="h-5 w-5 text-yellow-400 fill-current"
													/>
												)
											)}
										</div>
										<p className="text-gray-700 mb-4">
											"{testimonial.content}"
										</p>
										<div>
											<p className="font-semibold text-gray-900">
												{testimonial.name}
											</p>
											<p className="text-sm text-gray-600">
												{testimonial.role}
											</p>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				</div>

				{/* CTA Section */}
				<div className="bg-light-green py-16">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
						<h2 className="text-3xl font-bold text-black mb-4">
							Ready to Protect Your Legacy?
						</h2>
						<p className="text-lg text-black/80 mb-8 max-w-2xl mx-auto">
							Join thousands of families who have already secured their future
							with Legacy In Order.
						</p>
						<Link to="/app/payment/checkout?description=Will Creation Service">
							<Button className="bg-black hover:bg-black/90 text-white px-8 py-3 text-lg">
								Get Started Today
							</Button>
						</Link>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
}
