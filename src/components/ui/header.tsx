import { Link } from "react-router-dom";

export function Header() {
	return (
		<header className="w-full border-b relative overflow-hidden h-[600px]">
			{/* Video Background */}
			<div className="absolute inset-0 w-full h-full z-0">
				<video
					className="w-full h-full object-cover"
					autoPlay
					loop
					muted
					playsInline
				>
					<source src="/videos/header-background.mp4" type="video/mp4" />
					Your browser does not support video backgrounds.
				</video>
				{/* Overlay for better text readability */}
				<div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
			</div>

			{/* Header Content */}
			<div className="w-full max-w-[2000px] mx-auto flex flex-col h-full">
				{/* Navigation Bar */}
				<div className="flex items-center justify-between px-4 md:px-6 lg:px-8 h-16 relative z-10">
					<div className="flex">
						<Link to="/" className="flex items-center">
							<img
								src="/logos/LIO_Logo_White.svg"
								alt="Legacy In Order"
								className="h-10"
							/>
						</Link>
					</div>
					<nav className="hidden md:flex items-center">
						<div className="flex space-x-20">
							<Link
								to="/services"
								className="text-white hover:text-white/80 transition-colors text-base font-medium"
							>
								Services
							</Link>
							<Link
								to="/about"
								className="text-white hover:text-white/80 transition-colors text-base font-medium"
							>
								About Us
							</Link>
							<Link
								to="/pricing"
								className="text-white hover:text-white/80 transition-colors text-base font-medium"
							>
								Pricing
							</Link>
						</div>
					</nav>
					<div className="flex items-center gap-3">
						<Link
							to="/login"
							className="flex items-center justify-center h-[41px] w-[90px] bg-white border border-[#3E4029] rounded-md text-[#3E4029] font-medium hover:bg-[#f8f8f8] transition-colors"
						>
							Sign In
						</Link>
						<Link
							to="/schedule"
							className="flex items-center justify-center h-[41px] w-[150px] bg-white border border-[#3E4029] rounded-md text-[#3E4029] font-medium hover:bg-[#f8f8f8] transition-colors"
						>
							Schedule a Call
						</Link>
					</div>
				</div>

				{/* White Divider Line */}
				<div className="w-full h-px bg-white/30 relative z-10"></div>

				{/* Hero Content */}
				<div className="flex-1 flex flex-col justify-center px-4 md:px-12 lg:px-20 relative z-10 mt-16">
					<div className="max-w-3xl">
						<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-left">
							Plan your legacy with confidence
						</h1>
						<p className="text-xl text-white/90 mt-4 text-left max-w-2xl">
							Professional estate planning services to protect what matters most
						</p>
						<div className="mt-8">
							<Link
								to="/get-started"
								className="flex items-center justify-center h-12 px-8 bg-white border border-[#3E4029] rounded-md text-[#3E4029] font-semibold hover:bg-[#f8f8f8] transition-colors w-fit"
							>
								Get Started
							</Link>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
}
