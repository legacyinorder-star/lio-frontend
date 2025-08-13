import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { Link } from "react-router-dom";

export default function TermsConditionsPage() {
	return (
		<div className="flex min-h-screen w-full flex-col">
			<Navbar />
			<hr className="border-gray-200" />
			<main className="flex-1">
				<div className="max-w-4xl ms-22 me-auto px-4 sm:px-6 lg:px-8 py-16">
					<div className="prose prose-lg max-w-none">
						<h1 className="text-[3.5rem] font-semibold text-black mb-8">
							Terms of Service
						</h1>
						<p className="text-black mb-4">UK Version</p>
						<p className="text-black">Version Number: 1.0</p>
						<p className="text-black mb-4">Version Date: 13/08/2025</p>

						<p className="text-black mb-4">
							These Terms of Service ("Terms") govern your access to and use of
							the Legacy in Order platform, including our website, mobile
							applications, and any associated services (collectively, the
							"Services"). By accessing or using our Services, you agree to be
							bound by these Terms. If you do not agree, you must not use our
							Services.
						</p>

						<div className="space-y-8">
							<section>
								<h2 className="text-[2rem] font-medium text-black mb-4">
									1. Definitions
								</h2>
								<p className="text-black mb-4">
									"We", "Us", "Our" means Legacy In Order Ltd, a company
									registered in England and Wales with company number 16597440
									and registered office at 128 City Road, London, United
									Kingdom, EC1V 2NX. "You" means any individual or entity
									accessing or using our Services. "Content" means all text,
									graphics, images, audio, video, software, data compilations,
									page layout, underlying code and software and any other form
									of information capable of being stored in a computer that
									appears on or forms part of this website. "User Content" means
									any content submitted, uploaded, posted, or transmitted by a
									user.
								</p>
							</section>

							<section>
								<h2 className="text-[2rem] font-medium text-black mb-4">
									2. User Obligations
								</h2>
								<p className="text-black mb-4">
									You agree to use the Services only for lawful purposes and in
									accordance with these Terms. You must not use the Services:
								</p>
								<ul className="list-disc pl-6 text-black space-y-2">
									<li>
										In any way that breaches any applicable local, national, or
										international law or regulation.
									</li>
									<li>For any unlawful or fraudulent purpose.</li>
									<li>
										To transmit or procure the sending of unsolicited or
										unauthorised advertising or promotional material.
									</li>
									<li>
										To knowingly transmit any data, send or upload any material
										that contains viruses, trojans, worms, time-bombs, keystroke
										loggers, spyware, adware, or any other harmful programs.
									</li>
								</ul>
								<p className="text-black mb-4">
									You are responsible for ensuring that all persons who access
									the Services through your internet connection are aware of
									these Terms and comply with them.
								</p>
							</section>

							<section>
								<h2 className="text-[2rem] font-medium text-black mb-4">
									3. User Responsibilities
								</h2>
								<p className="text-black mb-4">
									As a user of our service, you agree to:
								</p>
								<ul className="list-disc pl-6 text-black space-y-2">
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
								<h2 className="text-[2rem] font-medium text-black mb-4">
									4. Payment Terms
								</h2>
								<p className="text-black mb-4">
									Payment is required to access our premium services. All fees
									are non-refundable unless otherwise stated. We reserve the
									right to change our pricing without prior notice.
								</p>
							</section>

							<section>
								<h2 className="text-[2rem] font-medium text-black mb-4">
									5. Intellectual Property Rights
								</h2>
								<p className="text-black mb-4">
									All intellectual property rights in the Services and the
									material published on it are owned by us or our licensors. You
									may not copy, reproduce, republish, download, post, broadcast,
									transmit, make available to the public, or otherwise use any
									content from our Services without prior written permission.
								</p>
							</section>

							<section>
								<h2 className="text-[2rem] font-medium text-black mb-4">
									6. Privacy and Data Protection
								</h2>
								<p className="text-black mb-4">
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
								<h2 className="text-[2rem] font-medium text-black mb-4">
									7. Limitation of Liability
								</h2>
								<p className="text-black mb-4">
									Legacy In Order shall not be liable for any indirect,
									incidental, special, consequential, or punitive damages,
									including without limitation, loss of profits, data, use,
									goodwill, or other intangible losses.
								</p>
								<p className="text-black mb-4">
									If you are a business user, we exclude all implied conditions,
									warranties, representations, or other terms that may apply to
									our Services. We will not be liable for any loss of profits,
									sales, business, or revenue; business interruption; loss of
									anticipated savings; loss of business opportunity, goodwill,
									or reputation; or any indirect or consequential loss or
									damage.
								</p>
								<p className="text-black mb-4">
									If you are a consumer, please note that we only provide our
									Services for domestic and private use.
								</p>
							</section>

							<section>
								<h2 className="text-[2rem] font-medium text-black mb-4">
									8. Disclaimers
								</h2>
								<p className="text-black mb-4">
									Our service is provided "as is" and "as available" without any
									warranties of any kind. We do not guarantee that the service
									will be uninterrupted or error-free.
								</p>
							</section>

							<section>
								<h2 className="text-[2rem] font-medium text-black mb-4">
									9. Legal Advice Disclaimer
								</h2>
								<p className="text-black mb-4">
									Legacy In Order is not a law firm and does not provide legal
									advice. Our service helps you create legal documents, but we
									recommend consulting with a qualified attorney for complex
									legal matters.
								</p>
							</section>

							<section>
								<h2 className="text-[2rem] font-medium text-black mb-4">
									10. Termination
								</h2>
								<p className="text-black mb-4">
									We may terminate or suspend your account and access to our
									service immediately, without prior notice, for any reason,
									including breach of these Terms.
								</p>
							</section>

							<section>
								<h2 className="text-[2rem] font-medium text-black mb-4">
									11. Governing Law
								</h2>
								<p className="text-black mb-4">
									These Terms are governed by and construed in accordance with
									the laws of England and Wales. If you are a consumer, you and
									we both agree that the courts of England and Wales will have
									exclusive jurisdiction except that if you are a resident of
									Northern Ireland, you may also bring proceedings in Northern
									Ireland, and if you are resident of Scotland, you may also
									bring proceedings in Scotland. If you are a business, you and
									we agree to the exclusive jurisdiction of the courts of
									England and Wales.
								</p>
							</section>

							<section>
								<h2 className="text-[2rem] font-medium text-black mb-4">
									12. Changes to Terms
								</h2>
								<p className="text-black mb-4">
									We reserve the right to modify these terms at any time. We
									will notify users of any material changes by posting the new
									terms on this page.
								</p>
							</section>

							<section>
								<h2 className="text-[2rem] font-medium text-black mb-4">
									13. Contact Information
								</h2>
								<p className="text-black mb-4">
									If you have any questions about these Terms & Conditions,
									please contact us at:
								</p>
								<div className="bg-gray-50 p-4 rounded-lg">
									<p className="text-black">
										Email: legal@legacyinorder.com
										<br />
										Address: 128, City Road, London, EC1V 2NX, United Kingdom
									</p>
								</div>
							</section>
						</div>
					</div>
				</div>
			</main>
			<Footer showCTA={false} />
		</div>
	);
}
