import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Shield, Users } from "lucide-react";
import { Header } from "@/components/ui/header";

export default function HomePage() {
	return (
		<div className="flex flex-col min-h-screen">
			<Header />

			{/* Hero Section */}
			<section className="py-20 md:py-28 bg-gradient-to-b from-background to-secondary/10">
				<div className="container px-4 md:px-6">
					<div className="flex flex-col items-center space-y-4 text-center">
						<div className="space-y-2">
							<h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
								Simplify Your Legal Legacy
							</h1>
							<p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
								Create, manage, and protect your important legal documents with
								our secure and easy-to-use platform.
							</p>
						</div>
						<div className="flex flex-col sm:flex-row gap-4">
							<Button asChild size="lg">
								<Link to="/signup">
									Get Started <ArrowRight className="ml-2 h-4 w-4" />
								</Link>
							</Button>
							<Button asChild variant="outline" size="lg">
								<Link to="/login">Sign In</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section id="features" className="py-12 md:py-20">
				<div className="container px-4 md:px-6">
					<div className="grid gap-8 md:grid-cols-3">
						<div className="flex flex-col items-center space-y-4 text-center">
							<div className="bg-primary/10 p-3 rounded-full">
								<FileText className="h-10 w-10 text-primary" />
							</div>
							<h3 className="text-xl font-bold">Document Creation</h3>
							<p className="text-muted-foreground">
								Create legally binding documents with our easy-to-use guided
								process.
							</p>
						</div>
						<div className="flex flex-col items-center space-y-4 text-center">
							<div className="bg-primary/10 p-3 rounded-full">
								<Shield className="h-10 w-10 text-primary" />
							</div>
							<h3 className="text-xl font-bold">Secure Storage</h3>
							<p className="text-muted-foreground">
								Keep your documents safe with our bank-level encryption and
								security.
							</p>
						</div>
						<div className="flex flex-col items-center space-y-4 text-center">
							<div className="bg-primary/10 p-3 rounded-full">
								<Users className="h-10 w-10 text-primary" />
							</div>
							<h3 className="text-xl font-bold">Family Sharing</h3>
							<p className="text-muted-foreground">
								Share documents securely with family members and trusted
								advisors.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section id="about" className="py-12 md:py-20 bg-muted">
				<div className="container px-4 md:px-6">
					<div className="flex flex-col items-center space-y-4 text-center">
						<div className="space-y-2">
							<h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
								Ready to get started?
							</h2>
							<p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
								Join thousands of users who trust us with their important
								documents.
							</p>
						</div>
						<div className="flex flex-col sm:flex-row gap-4">
							<Button asChild size="lg">
								<Link to="/signup">Create an Account</Link>
							</Button>
							<Button asChild variant="outline" size="lg">
								<Link to="/login">Sign In</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="py-6 md:py-12 border-t">
				<div className="container px-4 md:px-6">
					<div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-8">
						<div className="text-center md:text-left">
							<p className="text-sm text-muted-foreground">
								© 2023 Legacy In Order. All rights reserved.
							</p>
						</div>
						<div className="flex gap-4">
							<Link
								to="/about"
								className="text-sm text-muted-foreground hover:underline"
							>
								About
							</Link>
							<Link
								to="/terms"
								className="text-sm text-muted-foreground hover:underline"
							>
								Terms
							</Link>
							<Link
								to="/privacy"
								className="text-sm text-muted-foreground hover:underline"
							>
								Privacy
							</Link>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
