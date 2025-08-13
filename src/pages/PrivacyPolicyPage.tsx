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
						<p className="text-black mb-4">UK Version</p>
						<p className="text-black">Version Number: 1.0</p>
						<p className="text-black mb-4">Version Date: 13/08/2025</p>

						<div className="space-y-8">
							<section>
								<h2 className="text-[2rem] font-medium text-black mb-4">
									At-a-glance Summary
								</h2>
								<ul className="list-disc pl-6 text-black space-y-2">
									<li>
										We only collect the information we need to deliver our
										services, improve them, meet our legal obligations and keep
										things secure.
									</li>

									<li>We never sell your personal data.</li>

									<li>
										You’re in control: you can access, correct, export or delete
										your data.
									</li>

									<li>
										We use cookies to make our site work, understand
										performance, and (with your permission) personalise content
										and marketing.
									</li>

									<li>
										Questions? Contact us at privacy@legacyinorder.com or by
										post (see “Who we are”).
									</li>
								</ul>
							</section>
							<section>
								<h2 className="text-[2rem] font-medium text-black mb-4">
									1. Who we are and how to contact us
								</h2>
								<p className="text-black mb-4">
									This privacy policy applies to Legacy in Order Ltd (company
									number 16597440), registered in England and Wales.
								</p>
								<p className="text-black mb-2">
									Registered office: 128 City Road, London, United Kingdom, EC1V
									2NX.
								</p>
								<p className="text-black mb-2">
									Legacy in Order Ltd is the “data controller” of the personal
									information described in this notice.
								</p>
								<p className="text-black mb-2">
									Contact (privacy matters): info@legacyinorder.com
								</p>
								<p className="text-black mb-2">
									General contact: info@legacyinorder.com
								</p>
								<p className="text-black mb-2">
									Data Protection Lead: Amaka, amaka@legacyinorder.com (please
									use this address for data subject rights).
								</p>
							</section>

							<section>
								<h2 className="text-[2rem] font-medium text-black mb-4">
									2. Scope of this notice
								</h2>
								<p className="text-black mb-4">
									This notice covers personal data collected when you visit our
									website, create an account, use our services (including estate
									planning tools, will and lasting power of attorney (LPA)
									preparation, digital document vault, reminders, and customer
									support), take part in research, apply for roles, or otherwise
									interact with us. It also covers cookies and similar
									technologies on our website.
								</p>
							</section>

							<section>
								<h2 className="text-[2rem] font-medium text-black mb-4">
									3. The personal information we collect
								</h2>
								<p className="text-black mb-4">
									We collect different types of personal data depending on how
									you interact with us:
								</p>
								<ol
									className="pl-6 text-black space-y-2"
									style={{ listStyleType: "lower-alpha" }}
								>
									<li>
										Information you provide directly:
										<ul className="list-disc pl-6 text-black space-y-2">
											<li>
												Identity and contact: name, postal address, email
												address, phone number
											</li>
											<li>
												Account details: username, password, security questions,
												settings and preferences.
											</li>
											<li>
												Service inputs: information you enter into our tools
												(e.g., family, executors, beneficiaries, guardians;
												estate assets and liabilities; wishes and instructions).
											</li>
											<li>
												Uploads: files or documents you store in our vault
												(e.g., PDFs, scans, letters of wishes).
											</li>
											<li>
												Communications: support requests, reviews, survey
												responses, and correspondence.
											</li>
											<li>
												Payment details: billing address and payment
												confirmation. (Card details are processed by our payment
												provider; we don’t store full card numbers or CVV.)
											</li>
										</ul>
									</li>
									<li>
										Information we collect automatically:
										<ul className="list-disc pl-6 text-black space-y-2">
											<li>
												Technical: IP address, device type, OS, browser, time
												zone, language, referral URLs.
											</li>
											<li>
												Usage: pages visited, actions taken, session duration,
												crash logs, performance metrics.
											</li>
											<li>
												Location: inferred from IP address, approximate
												location.
											</li>
											<li>
												Cookies/SDKs: see “Cookies and similar technologies”.
											</li>
										</ul>
									</li>
									<li>
										Information from third parties:
										<ul className="list-disc pl-6 text-black space-y-2">
											<li>Payment processors (to confirm payments).</li>
											<li>
												Identity verification or fraud-prevention providers
												(where used).
											</li>
											<li>
												Public sources (e.g., Companies House) for business
												contracting and due diligence.
											</li>
											<li>
												Partners you authorise us to work with (e.g., law firms,
												executors, financial advisors).
											</li>
										</ul>
									</li>
									<li>
										Children and vulnerable individuals
										<p className="text-black mb-4">
											Our consumer services are designed for adults (16+ to use
											the site, 18+ for will/LPA). We may process limited
											information about children or vulnerable adults only when
											you choose to include it in your instructions (e.g.,
											guardianship details). Where required by law, we will ask
											for your explicit consent and take extra care with this
											data.
										</p>
									</li>
									<li>
										Special category data
										<p className="text-black mb-4">
											We only process special category data (e.g., health
											information, religious or philosophical beliefs) when you
											voluntarily provide it because it is relevant to your
											instructions (e.g., funeral wishes) and only with your
											explicit consent or where otherwise permitted by law.
										</p>
									</li>
								</ol>
							</section>

							<section>
								<h2 className="text-[2rem] font-medium text-black mb-4">
									4. Why we use your data (purposes) and our legal bases
								</h2>
								<p className="text-black mb-4">
									We use your data for the purposes below and rely on the legal
									bases indicated (UK GDPR Articles 6 and 9):
								</p>
								<table>
									<thead>
										<tr>
											<th>Purpose</th>
											<th>Examples</th>
											<th>Legal basis</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>Provide services and customer support</td>
											<td>
												Account creation; generate will/LPA documents; store
												files; respond to queries; reminders
											</td>
											<td>
												Contract; Legitimate interests (service efficiency)
											</td>
										</tr>
										<tr>
											<td>Payments and billing</td>
											<td>
												Process payments, issue invoices/receipts, fraud
												prevention
											</td>
											<td>Contract; Legal obligation; Legitimate interests</td>
										</tr>
										<tr>
											<td>Security, fraud prevention, and system integrity</td>
											<td>
												Monitoring access, rate-limiting, incident response
											</td>
											<td>Legitimate interests; Legal obligation</td>
										</tr>
										<tr>
											<td>Comply with law</td>
											<td>
												AML/CTF checks (where applicable), record retention,
												responding to regulators
											</td>
											<td>Legal obligation</td>
										</tr>
										<tr>
											<td>Improve and develop services</td>
											<td>Analytics, A/B testing, user research</td>
											<td>Legitimate interests (product improvement)</td>
										</tr>
										<tr>
											<td>Personalised content and marketing</td>
											<td>
												Email updates, offers, recommendations (non-essential
												cookies/consent-based)
											</td>
											<td>
												Consent; Legitimate interests (for existing customers,
												where PECR allows)
											</td>
										</tr>
										<tr>
											<td>Personalised content and marketing</td>
											<td>
												Email updates, offers, recommendations (non-essential
												cookies/consent-based)
											</td>
											<td>
												Consent; Legitimate interests (for existing customers,
												where PECR allows)
											</td>
										</tr>
										<tr>
											<td>Research and feedback</td>
											<td>Surveys, interviews, product feedback panels</td>
											<td>Legitimate interests; Consent (where required)</td>
										</tr>
										<tr>
											<td>Recruitment</td>
											<td>Applicant screening and onboarding</td>
											<td>Contract; Legitimate interests; Legal obligation</td>
										</tr>
									</tbody>
								</table>
							</section>

							<section>
								<h2 className="text-[2rem] font-medium text-black mb-4">
									5. Cookies and similar technologies
								</h2>
								<p className="text-black mb-4">
									We use cookies, SDKs and similar technologies to: (i) make our
									site work ( strictly necessary ), (ii) remember your settings,
									(iii) understand performance, and (iv) with your consent,
									personalise content/ads. Non-essential cookies will only run
									with your consent (per PECR). You can update preferences
									anytime via our cookie banner or settings link.
								</p>
								<h5 className="text-[1.5rem] font-medium text-black mb-4">
									Cookie categories we use
								</h5>
								<ul className="list-disc pl-6 text-black space-y-2 mb-4">
									<li>
										Strictly necessary — enable core features like login,
										security, load balancing. (Always on.)
									</li>
									<li>
										Performance/analytics — help us understand site usage and
										improve (e.g., page views, session length).
									</li>
									<li>
										Functionality — remember choices like language and region.
									</li>
									<li>
										Advertising/targeting — help deliver relevant content or
										measure campaigns (only with consent).
									</li>
								</ul>
								<p className="text-black mb-4">
									You can also control cookies through your browser. Blocking
									some cookies may affect site functionality.
								</p>
							</section>

							<section>
								<h2 className="text-[2rem] font-medium text-black mb-4">
									6. Automated decision-making and profiling
								</h2>
								<p className="text-black mb-4">
									We do not make decisions about you that produce legal or
									similarly significant effects based solely on automated
									processing. We may use limited profiling (e.g., to tailor
									content) with your consent or where permitted by law. You can
									opt out of direct marketing at any time.
								</p>
							</section>

							<section>
								<h2 className="text-[2rem] font-medium text-black mb-4">
									7. Who we share data with (and why)
								</h2>
								<ul className="list-disc pl-6 text-black space-y-2 mb-4">
									<li>
										Service providers (processors): hosting, storage, security,
										email/SMS, analytics, payment processing, customer support
										tooling.
									</li>
									<li>
										Professional advisers: auditors, insurers, accountants,
										legal counsel.
									</li>
									<li>
										Authorities: courts, regulators, law enforcement where
										legally required.
									</li>
									<li>
										Others with your permission: e.g., executors, attorneys,
										legal firms or financial advisors you nominate.
									</li>
								</ul>
								<p className="text-black mb-4">
									We require processors to use your data only on our documented
									instructions, keep it secure, and assist us with compliance
									(UK GDPR Art. 28). We keep a record of our processors and will
									update this policy or notify you of material changes where
									required.
								</p>
							</section>

							<section>
								<h2 className="text-[2rem] font-medium text-black mb-4">
									8. International transfers
								</h2>
								<p className="text-black mb-4">
									Some suppliers may process data outside the UK. Where this
									happens, we put in place safeguards recognised by UK law
									(e.g., UK International Data Transfer Agreement (IDTA) or EU
									Standard Contractual Clauses plus the UK Addendum). We also
									assess the laws and practices of the destination country to
									ensure essentially equivalent protection.
								</p>
							</section>

							<section>
								<h2 className="text-[2rem] font-medium text-black mb-4">
									9. How long we keep your data (retention)
								</h2>
								<p className="text-black mb-4">
									We retain personal data only for as long as needed for the
									purposes described, including to comply with legal, accounting
									or reporting requirements. Typical periods include:
								</p>
								<ul className="list-disc pl-6 text-black space-y-2 mb-4">
									<li>
										Account/profile data: for the life of your account and up to
										6 years after closure.
									</li>
									<li>
										Service output (e.g., wills/LPAs stored in the vault): until
										you delete it, your subscription ends, or we’re instructed
										to erase it.
									</li>
									<li>
										Communications/support: usually up to 3 years from last
										interaction, unless needed longer for legal claims.
									</li>
									<li>Transaction records: 6 years (HMRC requirement).</li>
								</ul>
								<p className="text-black mb-4">
									If you ask us to delete data sooner, we will do so unless we
									must keep it by law or for the establishment, exercise, or
									defence of legal claims.
								</p>
							</section>

							<section>
								<h2 className="text-[2rem] font-medium text-black mb-4">
									10. How we protect your data (security)
								</h2>
								<ul className="list-disc pl-6 text-black space-y-2 mb-4">
									<li>Encryption in transit and at rest for core systems.</li>
									<li>
										Access controls, role-based permissions and MFA for
										administrators.
									</li>
									<li>Vulnerability management and logging/monitoring.</li>
									<li>Employee training and confidentiality obligations.</li>
									<li>
										Supplier due diligence and data processing agreements.
									</li>
								</ul>
								<p className="text-black mb-4">
									No system is 100% secure. If we detect a personal data breach
									that poses a risk, we will notify the ICO and, where required,
									affected individuals without undue delay.
								</p>
							</section>
							<section>
								<h2 className="text-[2rem] font-medium text-black mb-4">
									11. Your privacy rights
								</h2>
								<ul className="list-disc pl-6 text-black space-y-2 mb-4">
									<li>Access — a copy of your personal data.</li>
									<li>
										Rectification — correct inaccurate or incomplete data.
									</li>
									<li>
										Erasure — delete your data in certain cases (“right to be
										forgotten”).
									</li>
									<li>
										Restriction — limit how we use your data in certain cases.
									</li>
									<li>
										Portability — receive your data in a structured, commonly
										used, machine-readable format and/or request we transmit it
										to another controller.
									</li>
									<li>
										Object — object to processing based on legitimate interests,
										and to direct marketing at any time.
									</li>
									<li>
										Withdraw consent — where we rely on consent, you can
										withdraw it at any time.
									</li>
								</ul>
								<p className="text-black mb-4">
									To exercise your rights, contact info@legacyinorder.com. We
									may need to verify your identity. We aim to respond within one
									month (extendable by two months for complex requests).
								</p>
							</section>

							<section>
								<h2 className="text-[2rem] font-medium text-black mb-4">
									12. Marketing preferences
								</h2>
								<p className="text-black mb-4">
									We’ll only send you marketing if you’ve opted in or where
									permitted by PECR for existing customers. You can opt out any
									time via the unsubscribe link or by contacting us.
								</p>
							</section>
							<section>
								<h2 className="text-[2rem] font-medium text-black mb-4">
									13. Third-party links and services
								</h2>
								<p className="text-black mb-4">
									Our website may link to third-party websites or services.
									Their privacy practices are their own; please review their
									policies.
								</p>
							</section>
							<section>
								<h2 className="text-[2rem] font-medium text-black mb-4">
									14. Complaints
								</h2>
								<p className="text-black mb-4">
									We hope to resolve your concerns. Contact us at
									info@legacyinorder.com. You can also complain to the UK
									Information Commissioner’s Office (ICO):
									https://www.ico.org.uk | tel: 0303 123 1113.
								</p>
							</section>

							<section>
								<h2 className="text-[2rem] font-medium text-black mb-4">
									15. Changes to this policy
								</h2>
								<p className="text-black mb-4">
									We may update this policy from time to time. We will post
									changes here and, if significant, notify you by email or
									in-product message.
								</p>
							</section>

							<section>
								<h2 className="text-[2rem] font-medium text-black mb-4">
									16. Glossary (plain English)
								</h2>
								<ul className="list-disc pl-6 text-black space-y-2 mb-4">
									<li>
										“Controller”: the organisation deciding why and how personal
										data is used.
									</li>

									<li>
										“Processor”: a supplier processing personal data for us
										under contract.
									</li>

									<li>
										“Personal data”: any information relating to an identified
										or identifiable person.
									</li>

									<li>
										“Special category data”: sensitive data needing extra
										protection (e.g., health).
									</li>
									<li>
										“PECR”: UK ePrivacy rules that govern cookies and electronic
										marketing.
									</li>
								</ul>
							</section>
						</div>
					</div>
				</div>
			</main>
			<Footer showCTA={false} />
		</div>
	);
}
