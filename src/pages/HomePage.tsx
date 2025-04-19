import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Shield, Users } from "lucide-react";
import { Header } from "@/components/ui/header";

export default function HomePage() {
	return (
		<div className="flex min-h-screen w-full flex-col">
			<Header />
			<main className="flex-1">
				{/* Hero Section */}
				<section className="w-full bg-background py-12 md:py-24 lg:py-32">
					<div className="w-full max-w-[2000px] mx-auto px-4 md:px-6 lg:px-8">
						<div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16">
							<div className="flex flex-col justify-center space-y-4">
								<div className="space-y-2">
									<h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
										Secure Your Legacy, Simplify Their Future
									</h1>
									<p className="max-w-[600px] text-muted-foreground md:text-xl">
										Streamline your estate planning with our comprehensive
										solution that keeps all your important documents and wishes
										in one secure place.
									</p>
								</div>
								<div className="flex flex-col gap-2 min-[400px]:flex-row">
									<Button asChild size="lg">
										<Link to="/signup">
											Get Started <ArrowRight className="ml-2 h-4 w-4" />
										</Link>
									</Button>
									<Button variant="outline" size="lg">
										Learn More
									</Button>
								</div>
							</div>
							<div className="flex items-center justify-center">
								<div className="w-full h-full bg-muted rounded-lg p-8 flex items-center justify-center">
									<p className="text-center text-lg font-medium">
										Hero Image Placeholder
									</p>
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
