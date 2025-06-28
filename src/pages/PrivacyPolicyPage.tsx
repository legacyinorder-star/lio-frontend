import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { Link } from "react-router-dom";

export default function PrivacyPolicyPage() {
	return (
		<div className="flex min-h-screen w-full flex-col">
			<Navbar />
			<hr className="border-gray-200" />
			<main className="flex-1">
				<div className="max-w-4xl ms-22 me-auto px-4 sm:px-6 lg:px-8 py-16">
					<div className="prose prose-lg max-w-none">
						<h1 className="text-[3.5rem] font-semibold text-black mb-8">
							Privacy Policy
						</h1>

						<div className="space-y-8">
							<section>
								<h2 className="text-[2rem] font-medium text-black mb-4">
									1. Information We Collect
								</h2>
								<p className="text-black mb-4">
									We collect information you provide directly to us, such as
									when you create an account, complete a will, or contact us for
									support. This may include:
								</p>
								<ul className="list-disc pl-6 text-black space-y-2">
									<li>
										Personal information (name, email address, phone number)
									</li>
									<li>Account credentials</li>
									<li>Will and estate planning information</li>
									<li>Payment information</li>
									<li>Communications with us</li>
								</ul>
							</section>

							<section>
								<h2 className="text-[2rem] font-medium text-black mb-4">
									2. How We Use Your Information
								</h2>
								<p className="text-black mb-4">
									We use the information we collect to:
								</p>
								<ul className="list-disc pl-6 text-black space-y-2">
									<li>Provide and maintain our services</li>
									<li>Process your payments</li>
									<li>Generate and store your legal documents</li>
									<li>Send you important updates about your account</li>
									<li>Respond to your questions and support requests</li>
									<li>Improve our services and develop new features</li>
								</ul>
							</section>

							<section>
								<h2 className="text-[2rem] font-medium text-black mb-4">
									3. Information Sharing
								</h2>
								<p className="text-black mb-4">
									We do not sell, trade, or otherwise transfer your personal
									information to third parties except in the following
									circumstances:
								</p>
								<ul className="list-disc pl-6 text-black space-y-2">
									<li>With your explicit consent</li>
									<li>To comply with legal obligations</li>
									<li>To protect our rights and safety</li>
									<li>With service providers who assist in our operations</li>
								</ul>
							</section>

							<section>
								<h2 className="text-[2rem] font-medium text-black mb-4">
									4. Data Security
								</h2>
								<p className="text-black mb-4">
									We implement appropriate security measures to protect your
									personal information against unauthorized access, alteration,
									disclosure, or destruction. These measures include:
								</p>
								<ul className="list-disc pl-6 text-black space-y-2">
									<li>Encryption of data in transit and at rest</li>
									<li>Regular security assessments</li>
									<li>Access controls and authentication</li>
									<li>Secure data centers</li>
								</ul>
							</section>

							<section>
								<h2 className="text-[2rem] font-medium text-black mb-4">
									5. Your Rights
								</h2>
								<p className="text-black mb-4">You have the right to:</p>
								<ul className="list-disc pl-6 text-black space-y-2">
									<li>Access your personal information</li>
									<li>Correct inaccurate information</li>
									<li>Request deletion of your information</li>
									<li>Opt out of marketing communications</li>
									<li>Export your data</li>
								</ul>
							</section>

							<section>
								<h2 className="text-[2rem] font-medium text-black mb-4">
									6. Cookies and Tracking
								</h2>
								<p className="text-black mb-4">
									We use cookies and similar technologies to enhance your
									experience, analyze usage, and provide personalized content.
									You can control cookie settings through your browser. For more
									information about how we handle your data, please see our{" "}
									<Link
										to="/terms-conditions"
										className="text-primary hover:underline font-semibold"
									>
										Terms & Conditions
									</Link>
									.
								</p>
							</section>

							<section>
								<h2 className="text-[2rem] font-medium text-black mb-4">
									7. Changes to This Policy
								</h2>
								<p className="text-black mb-4">
									We may update this Privacy Policy from time to time. We will
									notify you of any material changes by posting the new policy
									on this page and updating the "Last Updated" date.
								</p>
							</section>

							<div className="border-t pt-8 mt-12">
								<p className="text-[1rem] text-black">
									Last Updated: {new Date("2025-06-28").toLocaleDateString()}
								</p>
							</div>
						</div>
					</div>
				</div>
			</main>
			<Footer showCTA={false} />
		</div>
	);
}
