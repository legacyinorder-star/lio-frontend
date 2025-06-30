import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { Button } from "@/components/ui/button";

export default function AboutUsPage() {
	return (
		<div className="flex min-h-screen w-full flex-col">
			<Navbar />
			<main className="flex-1">
				{/* Hero Section */}
				<section className="w-full bg-white py-24 min-h-[500px] flex items-center">
					<div className="w-full max-w-[2000px] mx-auto px-4 md:px-6 lg:px-8">
						<div className="text-center space-y-8">
							<div className="space-y-6">
								<h1 className="text-[3rem] font-semibold leading-tight text-[#173C37]">
									Your future, organized by LegacyInOrder
								</h1>
								<p className="text-[1rem] font-normal leading-relaxed text-[#173C37] max-w-3xl mx-auto">
									LegacyInOrder simplifies and secures your most important
									personal and legal documents, giving you full control and
									peace of mind.
								</p>

								<p className="text-[1rem] font-normal leading-relaxed text-[#173C37] max-w-3xl mx-auto">
									With everything organized and easily accessible, you can focus
									on what truly matters: your future and the people you care
									about.
								</p>
							</div>

							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<Button
									variant="default"
									className="text-white bg-[#173C37] rounded border border-[#173C37] font-semibold px-8 py-6 hover:bg-[#173C37]/90"
								>
									Write my Will
								</Button>
								<Button
									variant="outline"
									className="text-[#173C37] border border-[#173C37] font-semibold rounded hover:bg-[#173C37] hover:text-white px-8 py-6"
								>
									Explore the Vault
								</Button>
							</div>
						</div>
					</div>
				</section>

				{/* About Section */}
				<section className="w-full bg-white py-12 lg:py-24">
					<div className="w-full max-w-[1400px] mx-auto px-8 md:px-12 lg:px-16">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
							{/* Left Side - Text Content */}
							<div className="space-y-6">
								<p
									className="text-[0.85rem] font-normal text-[#173C37] uppercase tracking-wider mb-8"
									style={{ letterSpacing: "0.175rem" }}
								>
									OUR MISSION
								</p>
								<h2 className="text-[2.5rem] font-semibold text-[#173C37] leading-tight">
									Making end-of-life planning easier
								</h2>
								<div className="space-y-4 text-[#173C37] leading-relaxed text-[1rem] font-normal">
									<p>
										Legacy In Order exists to help people prepare for the future
										without fear, overwhelm, or legal confusion. We simplify
										estate planning through thoughtful design so everyone can
										protect what matters most.
									</p>
								</div>
							</div>

							{/* Right Side - Image */}
							<div className="flex justify-center lg:justify-end">
								<img
									src="/images/about/father.png"
									alt="Father with family planning for the future"
									className="w-auto h-[21rem] rounded-[0.75rem] shadow-lg"
								/>
							</div>
						</div>
					</div>
				</section>

				{/* Second About Section - Flipped Layout */}
				<section
					className="w-full py-12 lg:py-24"
					style={{
						background: "linear-gradient(180deg, #FFF 0%, #DFF2EB 100%)",
					}}
				>
					<div className="w-full max-w-[1400px] mx-auto px-8 md:px-12 lg:px-16">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
							{/* Left Side - Image */}
							<div className="flex justify-center lg:justify-start order-2 lg:order-1">
								<img
									src="/images/about/daughter.png"
									alt="Family planning together"
									className="w-auto h-[21rem] rounded-[0.75rem] shadow-lg"
								/>
							</div>

							{/* Right Side - Text Content */}
							<div className="space-y-6 order-1 lg:order-2">
								<p
									className="text-[0.85rem] font-normal text-[#173C37] uppercase tracking-wider mb-8"
									style={{ letterSpacing: "0.175rem" }}
								>
									WHO WE'RE HERE FOR
								</p>
								<h2 className="text-[2.5rem] font-semibold text-[#173C37] leading-tight">
									We're committed to everybody.
								</h2>
								<div className="space-y-4 text-[#173C37] leading-relaxed text-[1rem] font-normal">
									<p>
										Whether you're just starting your career, raising a family,
										or planning retirement, Legacy In Order is built for you. We
										believe future-planning tools should be as common—and
										stress-free—as online banking or digital calendars.
									</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Features Section */}
				<section
					className="w-full bg-[#FAFAF5] py-6 md:py-12 lg:py-24"
					id="features"
				>
					<div className="w-full max-w-[2000px] mx-auto px-4 md:px-6 lg:px-8">
						<div className="mx-auto flex max-w-full flex-col items-center space-y-4 text-center">
							<h1 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl mb-2">
								The bigger picture
							</h1>
							<p className="text-[1rem] text-[#173C37] my-6 max-w-3xl">
								By helping individuals take control of their futures, we
								contribute to a broader culture of planning, protection, and
								care. We envision a world where end-of-life planning is
								normalized, not avoided.
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-4">
							{/* Card 1 */}
							<div className="flex flex-col items-left text-left bg-[#239485] p-8 rounded-xl shadow-sm">
								<div className="w-16 h-16 flex items-left justify-left mb-6">
									<img
										src="/svgs/family.svg"
										alt="Family Icon"
										className="w-16 h-16"
									/>
								</div>
								<p className="text-white text-[1.5rem] font-[500]">
									Preserving legacies all around the world
								</p>
							</div>

							{/* Card 2 */}
							<div className="flex flex-col text-left bg-white p-8 rounded-xl shadow-sm">
								<div className="flex gap-1 mb-4">
									{[...Array(5)].map((_, i) => (
										<svg
											key={i}
											className="w-5 h-5 text-[#0D4705]"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
										</svg>
									))}
								</div>
								<h3 className="text-[1rem] font-semibold mb-4 text-[#173C37]">
									Simple and Professional
								</h3>
								<p className="text-gray-600 mb-4 leading-relaxed flex-grow">
									The process was incredibly straightforward. I completed my
									will in less than 20 minutes and felt confident that
									everything was legally sound.
								</p>
								<div className="mt-auto">
									<h4 className="font-semibold text-gray-900 text-sm">
										Michael Thompson
									</h4>
									<p className="text-gray-600 text-xs">Financial Advisor</p>
								</div>
							</div>

							{/* Card 3 */}
							<div className="flex flex-col text-left bg-white p-8 rounded-xl shadow-sm">
								<div className="flex gap-1 mb-4">
									{[...Array(5)].map((_, i) => (
										<svg
											key={i}
											className="w-5 h-5 text-[#0D4705]"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
										</svg>
									))}
								</div>
								<h3 className="text-[1rem] font-semibold mb-4 text-[#173C37]">
									Peace of Mind at Last
								</h3>
								<p className="text-gray-600 mb-4 leading-relaxed flex-grow">
									After years of putting off estate planning, LegacyInOrder made
									it so easy. My family now has the security they deserve.
								</p>
								<div className="mt-auto">
									<h4 className="font-semibold text-gray-900 text-sm">
										Jennifer Martinez
									</h4>
									<p className="text-gray-600 text-xs">Marketing Director</p>
								</div>
							</div>

							{/* Card 4 */}
							<div className="flex flex-col text-left bg-white p-8 rounded-xl shadow-sm">
								<div className="flex gap-1 mb-4">
									{[...Array(5)].map((_, i) => (
										<svg
											key={i}
											className="w-5 h-5 text-[#0D4705]"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
										</svg>
									))}
								</div>
								<h3 className="text-[1rem] font-semibold mb-4 text-[#173C37]">
									Exceeded Expectations
								</h3>
								<p className="text-gray-600 mb-4 leading-relaxed flex-grow">
									The platform guided me through every step with clear
									explanations. I felt supported throughout the entire process.
								</p>
								<div className="mt-auto">
									<h4 className="font-semibold text-gray-900 text-sm">
										Robert Chen
									</h4>
									<p className="text-gray-600 text-xs">Small Business Owner</p>
								</div>
							</div>
						</div>
					</div>
				</section>
			</main>

			<Footer showCTA={false} />
		</div>
	);
}
