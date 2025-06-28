import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { Link } from "react-router-dom";

export default function TermsConditionsPage() {
	return (
		<div className="flex min-h-screen w-full flex-col">
			<Navbar />
			<hr className="border-gray-200" />
			<main className="flex-1">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
					<div className="prose prose-lg max-w-none">
						<h1 className="text-4xl font-bold text-primary mb-8">
							Terms & Conditions
						</h1>

						<div className="space-y-8">
							<section>
								<h2 className="text-2xl font-semibold text-primary mb-4">
									1. Acceptance of Terms
								</h2>
								<p className="text-gray-700 mb-4">
									By accessing and using Legacy In Order's services, you accept
									and agree to be bound by the terms and provision of this
									agreement. If you do not agree to abide by the above, please
									do not use this service.
								</p>
							</section>

							<section>
								<h2 className="text-2xl font-semibold text-primary mb-4">
									2. Description of Service
								</h2>
								<p className="text-gray-700 mb-4">
									Legacy In Order provides online will creation and estate
									planning services. Our platform allows users to:
								</p>
								<ul className="list-disc pl-6 text-gray-700 space-y-2">
									<li>
										Create legally valid wills and estate planning documents
									</li>
									<li>Store and manage important documents securely</li>
									<li>Access and update their documents at any time</li>
									<li>Receive guidance and support throughout the process</li>
								</ul>
							</section>

							<section>
								<h2 className="text-2xl font-semibold text-primary mb-4">
									3. User Responsibilities
								</h2>
								<p className="text-gray-700 mb-4">
									As a user of our service, you agree to:
								</p>
								<ul className="list-disc pl-6 text-gray-700 space-y-2">
									<li>Provide accurate and complete information</li>
									<li>Maintain the security of your account credentials</li>
									<li>Use the service only for lawful purposes</li>
									<li>
										Not attempt to gain unauthorized access to our systems
									</li>
									<li>Comply with all applicable laws and regulations</li>
								</ul>
							</section>

							<section>
								<h2 className="text-2xl font-semibold text-primary mb-4">
									4. Payment Terms
								</h2>
								<p className="text-gray-700 mb-4">
									Payment is required to access our premium services. All fees
									are non-refundable unless otherwise stated. We reserve the
									right to change our pricing with 30 days notice.
								</p>
							</section>

							<section>
								<h2 className="text-2xl font-semibold text-primary mb-4">
									5. Intellectual Property
								</h2>
								<p className="text-gray-700 mb-4">
									The content, features, and functionality of our service are
									owned by Legacy In Order and are protected by international
									copyright, trademark, and other intellectual property laws.
								</p>
							</section>

							<section>
								<h2 className="text-2xl font-semibold text-primary mb-4">
									6. Privacy and Data Protection
								</h2>
								<p className="text-gray-700 mb-4">
									Your privacy is important to us. Please review our{" "}
									<Link
										to="/privacy-policy"
										className="text-primary hover:underline font-semibold"
									>
										Privacy Policy
									</Link>
									, which also governs your use of the service, to understand
									our practices.
								</p>
							</section>

							<section>
								<h2 className="text-2xl font-semibold text-primary mb-4">
									7. Limitation of Liability
								</h2>
								<p className="text-gray-700 mb-4">
									Legacy In Order shall not be liable for any indirect,
									incidental, special, consequential, or punitive damages,
									including without limitation, loss of profits, data, use,
									goodwill, or other intangible losses.
								</p>
							</section>

							<section>
								<h2 className="text-2xl font-semibold text-primary mb-4">
									8. Disclaimers
								</h2>
								<p className="text-gray-700 mb-4">
									Our service is provided "as is" and "as available" without any
									warranties of any kind. We do not guarantee that the service
									will be uninterrupted or error-free.
								</p>
							</section>

							<section>
								<h2 className="text-2xl font-semibold text-primary mb-4">
									9. Legal Advice Disclaimer
								</h2>
								<p className="text-gray-700 mb-4">
									Legacy In Order is not a law firm and does not provide legal
									advice. Our service helps you create legal documents, but we
									recommend consulting with a qualified attorney for complex
									legal matters.
								</p>
							</section>

							<section>
								<h2 className="text-2xl font-semibold text-primary mb-4">
									10. Termination
								</h2>
								<p className="text-gray-700 mb-4">
									We may terminate or suspend your account and access to our
									service immediately, without prior notice, for any reason,
									including breach of these Terms.
								</p>
							</section>

							<section>
								<h2 className="text-2xl font-semibold text-primary mb-4">
									11. Governing Law
								</h2>
								<p className="text-gray-700 mb-4">
									These Terms shall be governed by and construed in accordance
									with the laws of the United Kingdom, without regard to its
									conflict of law provisions.
								</p>
							</section>

							<section>
								<h2 className="text-2xl font-semibold text-primary mb-4">
									12. Changes to Terms
								</h2>
								<p className="text-gray-700 mb-4">
									We reserve the right to modify these terms at any time. We
									will notify users of any material changes by posting the new
									terms on this page.
								</p>
							</section>

							<section>
								<h2 className="text-2xl font-semibold text-primary mb-4">
									13. Contact Information
								</h2>
								<p className="text-gray-700 mb-4">
									If you have any questions about these Terms & Conditions,
									please contact us at:
								</p>
								<div className="bg-gray-50 p-4 rounded-lg">
									<p className="text-gray-700">
										Email: legal@legacyinorder.com
										<br />
										Address: [Your Business Address]
										<br />
										Phone: [Your Phone Number]
									</p>
								</div>
							</section>

							<div className="border-t pt-8 mt-12">
								<p className="text-sm text-gray-500">
									Last Updated: {new Date().toLocaleDateString()}
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
