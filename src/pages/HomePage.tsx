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

				{/* CTA Section */}
				<section className="w-full bg-primary text-primary-foreground py-12 md:py-24 lg:py-32">
					<div className="w-full max-w-[2000px] mx-auto px-4 md:px-6 lg:px-8">
						<div className="flex flex-col items-center justify-center space-y-4 text-center">
							<h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
								Ready to Get Started?
							</h2>
							<p className="max-w-[600px] md:text-xl">
								Join thousands of users who've already simplified their estate
								planning process.
							</p>
							<Button size="lg" variant="secondary" asChild>
								<Link to="/signup">Sign Up Now</Link>
							</Button>
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
