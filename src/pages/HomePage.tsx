import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/ui/header";

export default function HomePage() {
	return (
		<div className="flex min-h-screen w-full flex-col">
			<Header />
			<main className="flex-1">
				{/* Hero Section */}
				<section className="w-full bg-background py-6 md:py-12 lg:py-24">
					<div className="w-full max-w-[2000px] mx-auto px-4 md:px-6 lg:px-8">
						<div className="justify-center space-y-4">
							<div className="space-y-2">
								<h2 className="text-muted-foreground text-[3.5rem] font-normal leading-[130%] tracking-[-0.07rem] pl-12">
									Planning for the future should be simple, not stressful.
									LegacyInOrder is making it effortless for young professionals
									to create legally sound wills, power of attorney documents,
									and letters of wishes, without the usual complexity or cost.
								</h2>
							</div>
							<div className="flex justify-end pl-12 mt-[4.3125rem]">
								<div className="w-1/3">
									<p className="text-[1.125rem] font-normal leading-[120%] tracking-[-0.0225rem]">
										Planning for the future should be simple, not stressful.
										LegacyInOrder is making it effortless for young
										professionals to create legally sound wills, power of
										attorney documents, and letters of wishes, without the usual
										complexity or cost.
									</p>
									<div className="flex items-center gap-3 mt-[2rem]">
										<Button
											variant="outline"
											className="flex items-center justify-center bg-transparent border border-black rounded-lg text-black"
										>
											<Link to="/login">Sign In</Link>
										</Button>

										<Button
											variant="outline"
											className="flex items-center justify-center bg-light-green border border-light-green rounded-lg text-black"
										>
											<Link to="/#">Create a Document</Link>
										</Button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Features Section */}
				<section
					className="w-full bg-light-gray py-6 md:py-12 lg:py-24"
					id="features"
				>
					<div className="w-full max-w-[2000px] mx-auto px-4 md:px-6 lg:px-8">
						<div className="mx-auto flex max-w-full flex-col items-start space-y-4 text-left">
							<div className="grid grid-cols-[40%_20%_40%] w-full items-end">
								<div>
									<h1 className="text-3xl font-normal tracking-tight sm:text-4xl md:text-5xl">
										What Document Do You Need?
									</h1>
									<p className="max-w-[85%] mt-6 text-muted-foreground">
										Answer a few guided questions, generate your document
										instantly, and securely store or download it for future use.
									</p>
								</div>
								<div></div>
								<div className="relative mb-1 flex justify-end">
									<input
										type="search"
										placeholder="Will, letter of attorney e.t.c."
										className="w-full px-4 py-2 pl-10 border border-black rounded-full focus:outline-none focus:ring-2 focus:ring-light-green"
									/>
									<svg
										className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
										/>
									</svg>
								</div>
							</div>
						</div>
						<div
							id="document-types"
							className="mx-auto grid gap-4 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-16"
						>
							<div className="flex flex-col items-center bg-white p-8 rounded-xl shadow-sm">
								<img
									src="/svgs/double_files.svg"
									alt="Will"
									className="h-48 w-48 mb-6"
								/>
								<h2 className="text-[40px] font-normal mb-4 w-full text-left">
									Wills
								</h2>
								<p className="text-black mb-8 w-full text-left">
									Create a legally binding will to ensure your assets are
									distributed according to your wishes.
								</p>
								<Button className="w-full bg-light-green text-lg">
									Create Will
								</Button>
							</div>

							<div className="flex flex-col items-center bg-white p-8 rounded-xl shadow-sm">
								<img
									src="/svgs/double_files.svg"
									alt="Power of Attorney"
									className="h-48 w-48 mb-6"
								/>
								<h2 className="text-[40px] font-normal mb-4 w-full text-left">
									Power of Attorney
								</h2>
								<p className="text-black mb-8 w-full text-left">
									Designate someone to make important decisions on your behalf
									if you become unable to do so.
								</p>
								<Button className="w-full bg-light-green text-lg">
									Create POA
								</Button>
							</div>

							<div className="flex flex-col items-center bg-white p-8 rounded-xl shadow-sm">
								<img
									src="/svgs/double_files.svg"
									alt="Letter of Wishes"
									className="h-48 w-48 mb-6"
								/>
								<h2 className="text-[40px] font-normal mb-4 w-full text-left">
									Letter of Wishes
								</h2>
								<p className="text-muted-foreground mb-8 w-full text-left">
									Document your personal wishes and preferences for your loved
									ones to follow.
								</p>
								<Button className="w-full bg-light-green text-lg">
									Create Letter of Wishes
								</Button>
							</div>
						</div>
					</div>
				</section>

				{/* Why LegacyInOrder Section */}
				<section className="w-full bg-[#083203] py-12">
					<div className="w-full max-w-[2000px] mx-auto px-4 md:px-6 lg:px-8">
						<div className="grid grid-cols-2 gap-8 items-start">
							<div className="text-white">
								<h1 className="text-[5rem] md:text-[4rem] font-normal mb-8">
									Why <br />
									LegacyInOrder
								</h1>
								<Button className="bg-[#083203] text-white hover:bg-gray-100 border border-white rounded-[4px]">
									Schedule a Consultation
								</Button>
							</div>
							<div className="text-white py-8 space-y-8">
								<div className="flex flex-col pt-4">
									<img
										src="/svgs/award.svg"
										alt="Award"
										className="h-12 w-12 mb-4"
									/>
									<h3 className="text-[40px] font-normal mb-2">
										15+ Years of Experience
									</h3>
									<p className="text-[16px] text-gray-300">
										Our knowledge and expertise, built upon since 1990, allows
										us to simplify complex processes and guide our clients
										effectively. Our system is designed to be quick and simple.
									</p>
								</div>

								<div className="flex flex-col">
									<img
										src="/svgs/shield.svg"
										alt="Shield"
										className="h-12 w-12 mb-4"
									/>
									<h3 className="text-[40px] font-normal mb-2">
										Secure Storage & Accessibility
									</h3>
									<p className="text-[16px]text-gray-300">
										Create legally sound documents in minutes, without expensive
										lawyer fees.
									</p>
								</div>

								<div className="flex flex-col">
									<img
										src="/svgs/lollipop.svg"
										alt="Verified"
										className="h-12 w-12 mb-4"
									/>
									<h3 className="text-[40px] font-normal mb-2">
										Expert-Reviewed Documents
									</h3>
									<p className="text-[16px] text-gray-300">
										All documents are reviewed by legal experts to ensure
										compliance with current laws.
									</p>
								</div>

								<div className="flex flex-col">
									<img
										src="/svgs/tag.svg"
										alt="Tags"
										className="h-12 w-12 mb-4"
									/>
									<h3 className="text-[40px] font-normal mb-2">
										Affordable and Transparent
									</h3>
									<p className="text-[16px] text-gray-300">
										No hidden fees or costly lawyer consultations—just a
										straightforward, cost-effective way to plan your future.
									</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Testimonials Section */}
				<section className="w-full bg-white py-12">
					<div className="w-full max-w-[2000px] mx-auto px-4 md:px-6 lg:px-8">
						<div className="relative flex flex-col items-center justify-center">
							{/* <div className="absolute -top-8 -left-8">
								<img
									src="/avatars/user1.png"
									alt="User avatar"
									className="h-20 w-20 rounded-full"
								/>
							</div>
							<div className="absolute -top-12 right-12">
								<img
									src="/avatars/user2.png"
									alt="User avatar"
									className="h-24 w-24 rounded-full"
								/>
							</div>
							<div className="absolute bottom-0 -left-12">
								<img
									src="/avatars/user3.png"
									alt="User avatar"
									className="h-28 w-28 rounded-full"
								/>
							</div>
							<div className="absolute -bottom-8 right-8">
								<img
									src="/avatars/user4.png"
									alt="User avatar"
									className="h-16 w-16 rounded-full"
								/>
							</div>
							<div className="absolute -top-4 left-1/4">
								<img
									src="/avatars/user5.png"
									alt="User avatar"
									className="h-32 w-32 rounded-full"
								/>
							</div>
							<div className="absolute -bottom-4 right-1/4">
								<img
									src="/avatars/user6.png"
									alt="User avatar"
									className="h-20 w-20 rounded-full"
								/>
							</div> */}
							<h1 className="text-[5rem] md:text-[4rem] font-normal text-center">
								Join over 400,000 People Who Trust LegacyInOrder
							</h1>
							<div className="grid grid-cols-3 gap-8 mt-16 w-full">
								<div className="bg-[#F5F5F5] p-8 rounded-lg">
									<div className="flex gap-1 mb-6">
										{[...Array(5)].map((_, i) => (
											<svg
												key={i}
												className="w-6 h-6 text-black"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
											</svg>
										))}
									</div>
									<p className="text-black text-[1.5rem] mb-6">
										LegacyInOrder made creating my will so simple. The guided
										process was clear and straightforward, and I feel confident
										knowing my affairs are in order.
									</p>
									<div className="flex items-center gap-4">
										<img
											src="/avatars/user1.png"
											alt="Sarah J."
											className="h-12 w-12 rounded-full"
										/>
										<div>
											<h3 className="font-semibold">Sarah J.</h3>
											<p className="text-sm text-gray-600">Business Owner</p>
										</div>
									</div>
								</div>

								<div className="bg-[#F5F5F5] p-8 rounded-lg">
									<div className="flex gap-1 mb-6">
										{[...Array(5)].map((_, i) => (
											<svg
												key={i}
												className="w-6 h-6 text-black"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
											</svg>
										))}
									</div>
									<p className="text-black text-[1.5rem] mb-6">
										The platform's security features give me peace of mind. I
										can update my documents anytime, and the legal verification
										process is thorough yet efficient.
									</p>
									<div className="flex items-center gap-4">
										<img
											src="/avatars/user2.png"
											alt="Michael C."
											className="h-12 w-12 rounded-full"
										/>
										<div>
											<h3 className="font-semibold">Michael C.</h3>
											<p className="text-sm text-gray-600">Software Engineer</p>
										</div>
									</div>
								</div>

								<div className="bg-[#F5F5F5] p-8 rounded-lg">
									<div className="flex gap-1 mb-6">
										{[...Array(5)].map((_, i) => (
											<svg
												key={i}
												className="w-6 h-6 text-black"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
											</svg>
										))}
									</div>
									<p className="text-black text-[1.5rem] mb-6">
										As someone who's seen the importance of proper estate
										planning, I appreciate how LegacyInOrder makes it accessible
										to everyone. The support team is exceptional.
									</p>
									<div className="flex items-center gap-4">
										<img
											src="/avatars/user3.png"
											alt="Emily R."
											className="h-12 w-12 rounded-full"
										/>
										<div>
											<h3 className="font-semibold">Emily R.</h3>
											<p className="text-sm text-gray-600">
												Healthcare Professional
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* FAQ Section */}
				<section className="w-full bg-white py-12">
					<div className="w-full max-w-[2000px] mx-auto px-4 md:px-6 lg:px-8">
						<h2 className="text-[5rem] md:text-[4rem] font-normal text-center mb-16">
							What People Usually Ask Us
						</h2>
						<div className="max-w-3xl mx-auto space-y-4">
							<div className="border rounded-lg">
								<button
									className="w-full px-6 py-4 text-left flex justify-between items-center"
									onClick={() => {
										const content = document.getElementById("faq1-content");
										const icon = document.getElementById("faq1-icon");
										if (content && icon) {
											content.classList.toggle("hidden");
											icon.classList.toggle("rotate-180");
										}
									}}
								>
									<span className="text-xl font-medium">
										What documents can I create with LegacyInOrder?
									</span>
									<svg
										id="faq1-icon"
										className="w-6 h-6 transform transition-transform duration-200"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M19 9l-7 7-7-7"
										/>
									</svg>
								</button>
								<div id="faq1-content" className="hidden px-6 pb-4">
									<p className="text-gray-600">
										You can create legally binding wills, power of attorney
										documents, and letters of wishes. Our platform guides you
										through each document creation process with clear,
										step-by-step instructions.
									</p>
								</div>
							</div>

							<div className="border rounded-lg">
								<button
									className="w-full px-6 py-4 text-left flex justify-between items-center"
									onClick={() => {
										const content = document.getElementById("faq2-content");
										const icon = document.getElementById("faq2-icon");
										if (content && icon) {
											content.classList.toggle("hidden");
											icon.classList.toggle("rotate-180");
										}
									}}
								>
									<span className="text-xl font-medium">
										How secure is my information?
									</span>
									<svg
										id="faq2-icon"
										className="w-6 h-6 transform transition-transform duration-200"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M19 9l-7 7-7-7"
										/>
									</svg>
								</button>
								<div id="faq2-content" className="hidden px-6 pb-4">
									<p className="text-gray-600">
										We use bank-level encryption to protect your data. All
										documents are stored securely and can only be accessed by
										you. We never share your information with third parties
										without your explicit consent.
									</p>
								</div>
							</div>

							<div className="border rounded-lg">
								<button
									className="w-full px-6 py-4 text-left flex justify-between items-center"
									onClick={() => {
										const content = document.getElementById("faq3-content");
										const icon = document.getElementById("faq3-icon");
										if (content && icon) {
											content.classList.toggle("hidden");
											icon.classList.toggle("rotate-180");
										}
									}}
								>
									<span className="text-xl font-medium">
										Can I update my documents later?
									</span>
									<svg
										id="faq3-icon"
										className="w-6 h-6 transform transition-transform duration-200"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M19 9l-7 7-7-7"
										/>
									</svg>
								</button>
								<div id="faq3-content" className="hidden px-6 pb-4">
									<p className="text-gray-600">
										Yes, you can update your documents at any time. We recommend
										reviewing and updating your documents annually or when
										significant life changes occur. All updates are tracked and
										versioned for your reference.
									</p>
								</div>
							</div>

							<div className="border rounded-lg">
								<button
									className="w-full px-6 py-4 text-left flex justify-between items-center"
									onClick={() => {
										const content = document.getElementById("faq4-content");
										const icon = document.getElementById("faq4-icon");
										if (content && icon) {
											content.classList.toggle("hidden");
											icon.classList.toggle("rotate-180");
										}
									}}
								>
									<span className="text-xl font-medium">
										Do I need a lawyer to use LegacyInOrder?
									</span>
									<svg
										id="faq4-icon"
										className="w-6 h-6 transform transition-transform duration-200"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M19 9l-7 7-7-7"
										/>
									</svg>
								</button>
								<div id="faq4-content" className="hidden px-6 pb-4">
									<p className="text-gray-600">
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

				{/* CTA Section */}
				<section className="w-full bg-primary text-primary-foreground py-12 md:py-24 lg:py-32">
					<div className="w-full max-w-[2000px] mx-auto px-4 md:px-6 lg:px-8">
						<div className="flex flex-col items-center justify-center space-y-4 text-center">
							<h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
								Ready to Put Your Legacy in Order?
							</h2>
							<div className="mt-8 flex gap-4">
								<Link
									to="/get-started"
									className="flex items-center justify-center h-12 px-8 bg-white border border-[#3E4029] rounded-lg text-[#3E4029] font-semibold hover:bg-[#f8f8f8] transition-colors w-fit"
								>
									<img
										src="/svgs/history_edu.svg"
										alt="Will Icon"
										className="w-5 h-5 mr-2"
									/>
									Write your Will
								</Link>
								<Link
									to="/get-started"
									className="flex items-center justify-center h-12 px-8 bg-white border border-[#3E4029] rounded-lg text-[#3E4029] font-semibold hover:bg-[#f8f8f8] transition-colors w-fit"
								>
									<img
										src="/svgs/legal_balance.svg"
										alt="Power of Attorney Icon"
										className="w-5 h-5 mr-2"
									/>
									Write a Power of Attorney
								</Link>
							</div>
						</div>
					</div>
				</section>
			</main>

			<footer className="w-full border-t bg-background py-6 md:py-10">
				<div className="w-full max-w-[2000px] mx-auto px-4 md:px-6 lg:px-8">
					<div className="flex flex-col items-center justify-between gap-4 md:flex-row">
						<p className="text-sm text-muted-foreground">
							&copy; {new Date().getFullYear()} Legacy In Order. All rights
							reserved.
						</p>
						<div className="flex gap-4">
							<Link
								to="/terms"
								className="text-sm text-muted-foreground hover:underline"
							>
								Terms of Service
							</Link>
							<Link
								to="/privacy"
								className="text-sm text-muted-foreground hover:underline"
							>
								Privacy Policy
							</Link>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
