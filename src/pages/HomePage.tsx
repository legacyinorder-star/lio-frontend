import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, Shield, Users } from "lucide-react";
import { Header } from "@/components/ui/header";

export default function HomePage() {
	return (
		<div className="flex min-h-screen w-full flex-col">
			<Header />
			<main className="flex-1">
				{/* Hero Section */}
				<section className="w-full bg-background py-12 md:py-24 lg:py-32">
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
					className="w-full bg-muted/50 py-12 md:py-24 lg:py-32"
					id="features"
				>
					<div className="w-full max-w-[2000px] mx-auto px-4 md:px-6 lg:px-8">
						<div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
							<h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
								Key Features
							</h2>
							<p className="max-w-[85%] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
								Everything you need to organize your estate planning in one
								secure platform
							</p>
						</div>
						<div className="mx-auto grid gap-4 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-16 max-w-[1300px]">
							<div className="flex flex-col items-center justify-center space-y-2 border bg-background p-6 rounded-lg">
								<div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
									<FileText className="h-8 w-8" />
								</div>
								<h3 className="text-xl font-bold">Document Storage</h3>
								<p className="text-sm text-muted-foreground text-center">
									Securely store and organize all your important documents in
									one place.
								</p>
							</div>
							<div className="flex flex-col items-center justify-center space-y-2 border bg-background p-6 rounded-lg">
								<div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
									<Users className="h-8 w-8" />
								</div>
								<h3 className="text-xl font-bold">Beneficiary Management</h3>
								<p className="text-sm text-muted-foreground text-center">
									Easily designate and manage beneficiaries for your assets and
									important documents.
								</p>
							</div>
							<div className="flex flex-col items-center justify-center space-y-2 border bg-background p-6 rounded-lg">
								<div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
									<Shield className="h-8 w-8" />
								</div>
								<h3 className="text-xl font-bold">Advanced Security</h3>
								<p className="text-sm text-muted-foreground text-center">
									Bank-level encryption and security protocols to protect your
									sensitive information.
								</p>
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
