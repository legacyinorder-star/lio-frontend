import { Link } from "react-router-dom";

export function AuthPageHeader() {
	return (
		<header className="w-full relative overflow-hidden">
			<div className="w-full max-w-[2000px] mx-auto flex flex-col h-full">
				{/* Navigation Bar */}
				<div className="flex pt-10 px-4 md:px-6 lg:px-8 h-16">
					<div className="flex">
						<Link to="/" className="flex items-center">
							<img
								src="/logos/LIO_Logo_Color.svg"
								alt="Legacy In Order"
								className="h-10"
							/>
						</Link>
					</div>
				</div>
				<hr className="my-5 border-t border-[#CCCCCC]" />
			</div>
		</header>
	);
}
