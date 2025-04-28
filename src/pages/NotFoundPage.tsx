import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFoundPage() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-background text-center px-4">
			<div className="max-w-md space-y-6">
				<div className="space-y-2">
					<h1 className="text-7xl font-bold text-primary">404</h1>
					<h2 className="text-3xl font-bold tracking-tight">Page not found</h2>
					<p className="text-muted-foreground">
						Sorry, we couldn't find the page you're looking for. It might have
						been moved, deleted, or never existed.
					</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-2 justify-center">
					<Button asChild>
						<Link to="/">
							<Home className="mr-2 h-4 w-4" />
							Back to Home
						</Link>
					</Button>
					<Button variant="outline" asChild>
						<Link to="/app/dashboard">Go to Dashboard</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
