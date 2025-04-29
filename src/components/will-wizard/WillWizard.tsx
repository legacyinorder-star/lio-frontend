import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SpouseDialog, { SpouseData } from "./SpouseDialog";
import { ArrowRight } from "lucide-react";

// Define the different question types
type QuestionType =
	| "name"
	| "hasSpouse"
	| "hasChildren"
	| "hasAssets"
	| "finished";

// Define the form data structure
interface WillFormData {
	name: string;
	hasSpouse: boolean;
	spouse?: SpouseData;
	// We'll add more fields as needed
}

export default function WillWizard() {
	// Track the current question being shown
	const [currentQuestion, setCurrentQuestion] = useState<QuestionType>("name");

	// Data collection
	const [formData, setFormData] = useState<WillFormData>({
		name: "",
		hasSpouse: false,
	});

	// For the spouse dialog
	const [spouseDialogOpen, setSpouseDialogOpen] = useState(false);

	// Add this at the top of the component
	const [mounted, setMounted] = useState(false);

	// Ensure we're mounted before rendering any dialogs
	useEffect(() => {
		setMounted(true);
	}, []);

	// Handle name input
	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData((prev) => ({ ...prev, name: e.target.value }));
	};

	// Handle spouse question response
	const handleHasSpouse = (hasSpouse: boolean) => {
		setFormData((prev) => ({ ...prev, hasSpouse }));

		if (hasSpouse) {
			// Open the spouse dialog if they have a spouse
			setSpouseDialogOpen(true);
		} else {
			// Move to the next question if they don't have a spouse
			setCurrentQuestion("hasChildren");
		}
	};

	// Handle spouse data from dialog
	const handleSpouseData = (spouseData: SpouseData) => {
		setFormData((prev) => ({ ...prev, spouse: spouseData }));
		// Move to the next question after spouse data is collected
		setCurrentQuestion("hasChildren");
	};

	// Handle moving to the next question for simple inputs
	const handleNext = () => {
		if (currentQuestion === "name") {
			if (formData.name.trim().length < 2) {
				// Show validation error
				return;
			}
			setCurrentQuestion("hasSpouse");
		}
	};

	// Render different content based on current question
	const renderQuestion = () => {
		switch (currentQuestion) {
			case "name":
				return (
					<div className="space-y-4">
						<div className="text-2xl font-semibold">
							What is your full name?
						</div>
						<div className="text-muted-foreground">
							We'll use this as the legal name in your will.
						</div>
						<div className="space-y-2">
							<Label htmlFor="name">Full Name</Label>
							<Input
								id="name"
								value={formData.name}
								onChange={handleNameChange}
								placeholder="John Doe"
								className="max-w-md"
							/>
						</div>
						<Button
							onClick={handleNext}
							disabled={formData.name.trim().length < 2}
							className="mt-4"
						>
							Next <ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</div>
				);

			case "hasSpouse":
				return (
					<div className="space-y-4">
						<div className="text-2xl font-semibold">Are you married?</div>
						<div className="text-muted-foreground">
							If you're married, we'll need some information about your spouse.
						</div>
						<div className="flex space-x-4 mt-6">
							<Button variant="outline" onClick={() => handleHasSpouse(false)}>
								No
							</Button>
							<Button variant="default" onClick={() => handleHasSpouse(true)}>
								Yes
							</Button>
						</div>
					</div>
				);

			case "hasChildren":
				return (
					<div className="space-y-4">
						<div className="text-2xl font-semibold">Do you have children?</div>
						<div className="text-muted-foreground">
							This information helps us create the appropriate provisions in
							your will.
						</div>
						{/* This would be expanded in the next iteration */}
						<div className="mt-4">
							<p>This question will be implemented in the next step.</p>
							<Button
								className="mt-4"
								onClick={() => setCurrentQuestion("hasAssets")}
							>
								Next <ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</div>
					</div>
				);

			case "hasAssets":
				return (
					<div className="space-y-4">
						<div className="text-2xl font-semibold">
							Do you own significant assets?
						</div>
						<div className="text-muted-foreground">
							This includes property, investments, or valuable possessions.
						</div>
						{/* This would be expanded in the next iteration */}
						<div className="mt-4">
							<p>This question will be implemented in the next step.</p>
							<Button
								className="mt-4"
								onClick={() => setCurrentQuestion("finished")}
							>
								Next <ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</div>
					</div>
				);

			case "finished":
				return (
					<div className="space-y-4">
						<div className="text-2xl font-semibold text-green-600">
							Thank you!
						</div>
						<div className="text-lg">
							We've collected the initial information for your will.
						</div>
						<div>
							<p className="text-muted-foreground">
								Summary of your information:
							</p>
							<ul className="mt-2 space-y-2">
								<li>
									<strong>Name:</strong> {formData.name}
								</li>
								<li>
									<strong>Marital Status:</strong>{" "}
									{formData.hasSpouse ? "Married" : "Not Married"}
								</li>
								{formData.spouse && (
									<li>
										<strong>Spouse:</strong> {formData.spouse.fullName}
									</li>
								)}
								{/* More summary items would be added here */}
							</ul>
						</div>
					</div>
				);

			default:
				return null;
		}
	};

	// Track progress
	const totalQuestions = 4; // name, hasSpouse, hasChildren, hasAssets
	const progress = (() => {
		switch (currentQuestion) {
			case "name":
				return 1;
			case "hasSpouse":
				return 2;
			case "hasChildren":
				return 3;
			case "hasAssets":
				return 4;
			case "finished":
				return 4;
			default:
				return 1;
		}
	})();

	const progressPercent = (progress / totalQuestions) * 100;

	return (
		<div className="container mx-auto py-8">
			<Card className="max-w-3xl mx-auto">
				<CardHeader>
					<CardTitle>Create Your Will</CardTitle>
					{/* Progress bar */}
					<div className="w-full bg-muted h-2 rounded-full mt-4">
						<div
							className="bg-primary h-2 rounded-full transition-all duration-500 ease-in-out"
							style={{ width: `${progressPercent}%` }}
						/>
					</div>
					<div className="text-xs text-muted-foreground mt-1">
						Question {progress} of {totalQuestions}
					</div>
				</CardHeader>
				<CardContent className="pt-6">{renderQuestion()}</CardContent>
			</Card>

			{/* Only render dialog after component is mounted */}
			{mounted && (
				<SpouseDialog
					open={spouseDialogOpen}
					onOpenChange={setSpouseDialogOpen}
					onSave={handleSpouseData}
				/>
			)}
		</div>
	);
}
