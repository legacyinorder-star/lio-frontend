import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { apiClient } from "@/utils/apiClient";
import { MessagesSquare } from "lucide-react";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";

const contactFormSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Please enter a valid email address"),
	subject: z.string().min(5, "Subject must be at least 5 characters"),
	message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function ContactUsPage() {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<ContactFormData>({
		resolver: zodResolver(contactFormSchema),
	});

	const onSubmit = async (data: ContactFormData) => {
		setIsSubmitting(true);
		try {
			const response = await apiClient("/contact/send-email", {
				method: "POST",
				body: JSON.stringify(data),
				authenticated: false, // Contact form doesn't require authentication
			});

			if (response.error) {
				toast.error("Failed to send message. Please try again.");
				console.error("Contact form error:", response.error);
			} else {
				toast.success("Message sent successfully! We'll get back to you soon.");
				reset();
			}
		} catch (error) {
			toast.error("Failed to send message. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="flex min-h-screen w-full flex-col">
			<Navbar />
			<main className="flex-1">
				<div className="min-h-300 bg-[#E6F5EF] py-12">
					<div
						id="contact-content"
						className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
					>
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
							{/* Left Side - Heading and Subtitle */}
							<div className="flex flex-col pt-24 pl-32">
								<h1 className="font-semibold text-[#173C37] mb-4">
									Get in touch
								</h1>
								<p className="text-1rem font-normal text-[#173C37]">
									Need help? Got a question? We're here to help you.
								</p>
							</div>

							{/* Right Side - Contact Form Card */}
							<div>
								<div
									className="p-6"
									style={{
										borderRadius: "0.75rem",
										background: "#FFF",
										boxShadow: "0 2px 12px 0 rgba(0, 0, 0, 0.10)",
									}}
								>
									<div className="mb-6">
										<p
											className="flex items-center gap-2"
											style={{
												fontSize: "1rem",
												color: "#173C37",
												fontWeight: "500",
												lineHeight: "120%",
											}}
										>
											<MessagesSquare className="h-6 w-6 text-[#239485]" />
											Type in your message below and we'll get back to you
											shortly via email
										</p>
									</div>
									<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
										<div className="space-y-2">
											<Label htmlFor="name">Full Name *</Label>
											<Input
												id="name"
												{...register("name")}
												placeholder="Enter your full name"
												className={errors.name ? "border-red-500" : ""}
												style={{
													borderRadius: "0.25rem",
													border: "1px solid #CCC",
													background: "#FFF",
												}}
											/>
											{errors.name && (
												<p className="text-sm text-red-600">
													{errors.name.message}
												</p>
											)}
										</div>

										<div className="space-y-2">
											<Label htmlFor="email">Email Address *</Label>
											<Input
												id="email"
												type="email"
												{...register("email")}
												placeholder="Enter your email address"
												className={errors.email ? "border-red-500" : ""}
												style={{
													borderRadius: "0.25rem",
													border: "1px solid #CCC",
													background: "#FFF",
												}}
											/>
											{errors.email && (
												<p className="text-sm text-red-600">
													{errors.email.message}
												</p>
											)}
										</div>

										<div className="space-y-2">
											<Label htmlFor="subject">Subject *</Label>
											<Input
												id="subject"
												{...register("subject")}
												placeholder="What is this about?"
												className={errors.subject ? "border-red-500" : ""}
												style={{
													borderRadius: "0.25rem",
													border: "1px solid #CCC",
													background: "#FFF",
												}}
											/>
											{errors.subject && (
												<p className="text-sm text-red-600">
													{errors.subject.message}
												</p>
											)}
										</div>

										<div className="space-y-2">
											<Label htmlFor="message">Message *</Label>
											<Textarea
												id="message"
												{...register("message")}
												placeholder="Tell us how we can help you..."
												rows={4}
												className={errors.message ? "border-red-500" : ""}
												style={{
													borderRadius: "0.25rem",
													border: "1px solid #CCC",
													background: "#FFF",
												}}
											/>
											{errors.message && (
												<p className="text-sm text-red-600">
													{errors.message.message}
												</p>
											)}
										</div>

										<Button
											type="submit"
											disabled={isSubmitting}
											className="w-40 bg-[#173C37] hover:bg-[#173C37]/90 text-white py-3"
										>
											{isSubmitting ? (
												<>
													<div className="h-5 w-5 animate-spin rounded-full border-t-2 border-b-2 border-white mr-2" />
													Sending Message...
												</>
											) : (
												"Send Message"
											)}
										</Button>
									</form>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
			<Footer showCTA={false} />
		</div>
	);
}
