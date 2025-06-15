import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/ui/header";
import { useAuth } from "@/hooks/useAuth";

export default function HomePage() {
	const { user } = useAuth();

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
											<Link to={user ? "/app/dashboard" : "/login"}>
												{user ? "Dashboard" : "Sign In"}
											</Link>
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
						<div className="max-w-3xl mx-auto space-y-1">
							<div className="border rounded-lg bg-[#F2F2EF]">
								<button
									className="w-full px-[35px] py-[25px] text-left flex justify-between items-center"
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
									<span className="text-[1.5rem] font-medium font-['Hedvig_Letters_Serif']">
										What documents can I create with LegacyInOrder?
									</span>
									<span id="faq1-icon" className="text-2xl font-light">
										+
									</span>
								</button>
								<div id="faq1-content" className="hidden px-[35px] pb-[25px]">
									<p className="text-[1rem] text-gray-600 font-['DM_Sans']">
										You can create legally binding wills, power of attorney
										documents, and letters of wishes. Our platform guides you
										through each document creation process with clear,
										step-by-step instructions.
									</p>
								</div>
							</div>

							<div className="border rounded-lg bg-[#F2F2EF]">
								<button
									className="w-full px-[35px] py-[25px] text-left flex justify-between items-center"
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
									<span className="text-[1.5rem] font-medium font-['Hedvig_Letters_Serif']">
										How secure is my information?
									</span>
									<span id="faq2-icon" className="text-2xl font-light">
										+
									</span>
								</button>
								<div id="faq2-content" className="hidden px-[35px] pb-[25px]">
									<p className="text-[1rem] text-gray-600 font-['DM_Sans']">
										We use bank-level encryption to protect your data. All
										documents are stored securely and can only be accessed by
										you. We never share your information with third parties
										without your explicit consent.
									</p>
								</div>
							</div>

							<div className="border rounded-lg bg-[#F2F2EF]">
								<button
									className="w-full px-[35px] py-[25px] text-left flex justify-between items-center"
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
									<span className="text-[1.5rem] font-medium font-['Hedvig_Letters_Serif']">
										Can I update my documents later?
									</span>
									<span id="faq3-icon" className="text-2xl font-light">
										+
									</span>
								</button>
								<div id="faq3-content" className="hidden px-[35px] pb-[25px]">
									<p className="text-[1rem] text-gray-600 font-['DM_Sans']">
										Yes, you can update your documents at any time. We recommend
										reviewing and updating your documents annually or when
										significant life changes occur. All updates are tracked and
										versioned for your reference.
									</p>
								</div>
							</div>

							<div className="border rounded-lg bg-[#F2F2EF]">
								<button
									className="w-full px-[35px] py-[25px] text-left flex justify-between items-center"
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
									<span className="text-[1.5rem] font-medium font-['Hedvig_Letters_Serif']">
										Do I need a lawyer to use LegacyInOrder?
									</span>
									<span id="faq4-icon" className="text-2xl font-light">
										+
									</span>
								</button>
								<div id="faq4-content" className="hidden px-[35px] pb-[25px]">
									<p className="text-[1rem] text-gray-600 font-['DM_Sans']">
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

			<footer className="w-full pb-6 border-t bg-background">
				<div className="w-full max-w-[2000px] mx-auto px-4 md:px-6 lg:px-8">
					{/* White Divider Line */}
					<div className="w-full h-px bg-[#CCCCCC]/30 relative z-10 mb-12"></div>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
						{/* Column 1: Logo and Social Media */}
						<div className="flex flex-col space-y-6">
							<img
								src="/logos/LIO_Logo_Color.svg"
								alt="LegacyInOrder Logo"
								className="w-40 h-auto"
							/>
							<div className="flex space-x-4">
								<a href="#" className="text-gray-600 hover:text-gray-900">
									<svg
										className="h-6 w-6"
										fill="currentColor"
										viewBox="0 0 24 24"
									>
										<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
									</svg>
								</a>
								<a href="#" className="text-gray-600 hover:text-gray-900">
									<svg
										className="h-6 w-6"
										fill="currentColor"
										viewBox="0 0 24 24"
									>
										<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
									</svg>
								</a>
								<a href="#" className="text-gray-600 hover:text-gray-900">
									<svg
										className="h-6 w-6"
										fill="currentColor"
										viewBox="0 0 24 24"
									>
										<path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
									</svg>
								</a>
								<a href="#" className="text-gray-600 hover:text-gray-900">
									<svg
										className="h-6 w-6"
										fill="currentColor"
										viewBox="0 0 24 24"
									>
										<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
									</svg>
								</a>
							</div>
						</div>

						{/* Column 2: Links */}
						<div className="flex flex-col space-y-4">
							<h3 className="font-semibold text-lg mb-2">Explore</h3>
							<ul className="space-y-2">
								<li>
									<a href="#" className="text-gray-600 hover:text-gray-900">
										How It Works
									</a>
								</li>
								<li>
									<a href="#" className="text-gray-600 hover:text-gray-900">
										Legal Documents
									</a>
								</li>
								<li>
									<a href="#" className="text-gray-600 hover:text-gray-900">
										Blog
									</a>
								</li>
								<li>
									<a href="#" className="text-gray-600 hover:text-gray-900">
										Glossary
									</a>
								</li>
								<li>
									<a href="#" className="text-gray-600 hover:text-gray-900">
										Resources
									</a>
								</li>
							</ul>
						</div>

						{/* Column 3: Links */}
						<div className="flex flex-col space-y-4">
							<h3 className="font-semibold text-lg mb-2">Support</h3>
							<ul className="space-y-2">
								<li>
									<a href="#" className="text-gray-600 hover:text-gray-900">
										Help Center
									</a>
								</li>
								<li>
									<a href="#" className="text-gray-600 hover:text-gray-900">
										Contact Us
									</a>
								</li>
								<li>
									<a href="#" className="text-gray-600 hover:text-gray-900">
										FAQs
									</a>
								</li>
							</ul>
						</div>

						{/* Column 4: Contact */}
						<div className="flex flex-col space-y-4">
							<h3 className="font-semibold text-lg mb-2">Contact Us</h3>
							<address className="not-italic text-gray-600">
								1st Floor
								<br />
								27 Downham Road
								<br />
								London N1 5AA123
							</address>
						</div>
					</div>

					{/* White Divider Line */}
					<div className="mt-12 w-full h-px bg-[#CCCCCC]/30 relative z-10"></div>

					{/* Bottom Copyright */}
					<div className="pt-8">
						<div className="flex flex-col md:flex-row justify-between items-center">
							<p className="text-sm text-[#909097]">
								&copy; {new Date().getFullYear()} Legacy In Order. All rights
								reserved.
							</p>
							<div className="flex gap-4 mt-4 md:mt-0">
								<Link
									to="/terms"
									className="text-sm text-[#909097] hover:text-gray-900"
								>
									Terms of Service
								</Link>
								<Link
									to="/privacy"
									className="text-sm text-[#909097] hover:text-gray-900"
								>
									Privacy Policy
								</Link>
							</div>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
