import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RateLimitMonitor } from "@/components/ui/rate-limit-monitor";
import { apiClient } from "@/utils/apiClient";
import { toast } from "sonner";
import { Loader2, Send, TestTube } from "lucide-react";

interface TestResult {
	endpoint: string;
	status: number;
	success: boolean;
	duration: number;
	timestamp: Date;
	error?: string;
}

export default function RateLimitTestPage() {
	const [testEndpoint, setTestEndpoint] = useState("/relationships");
	const [isTestingBurst, setIsTestingBurst] = useState(false);
	const [isTesting, setIsTesting] = useState(false);
	const [testResults, setTestResults] = useState<TestResult[]>([]);

	const makeTestRequest = async (endpoint: string): Promise<TestResult> => {
		const startTime = Date.now();

		try {
			const response = await apiClient(endpoint);
			const duration = Date.now() - startTime;

			return {
				endpoint,
				status: response.status,
				success: response.error === null,
				duration,
				timestamp: new Date(),
				error: response.error || undefined,
			};
		} catch (error) {
			const duration = Date.now() - startTime;
			return {
				endpoint,
				status: 0,
				success: false,
				duration,
				timestamp: new Date(),
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	};

	const handleSingleRequest = async () => {
		if (!testEndpoint.trim()) {
			toast.error("Please enter an endpoint to test");
			return;
		}

		setIsTesting(true);
		try {
			const result = await makeTestRequest(testEndpoint);
			setTestResults((prev) => [result, ...prev].slice(0, 20)); // Keep last 20 results

			if (result.success) {
				toast.success(`Request successful (${result.duration}ms)`);
			} else {
				toast.error(`Request failed: ${result.error}`);
			}
		} finally {
			setIsTesting(false);
		}
	};

	const handleBurstTest = async () => {
		if (!testEndpoint.trim()) {
			toast.error("Please enter an endpoint to test");
			return;
		}

		setIsTestingBurst(true);
		setTestResults([]);

		try {
			toast.info("Starting burst test - sending 15 requests rapidly...");

			// Send 15 requests rapidly to test rate limiting
			const promises = Array.from({ length: 15 }, (_, i) =>
				makeTestRequest(`${testEndpoint}?burst=${i + 1}`)
			);

			const results = await Promise.all(promises);
			setTestResults(results.reverse()); // Show in chronological order

			const successCount = results.filter((r) => r.success).length;
			const rateLimitedCount = results.filter((r) => r.status === 429).length;

			toast.success(
				`Burst test completed: ${successCount} successful, ${rateLimitedCount} rate limited`
			);
		} catch (error) {
			toast.error("Burst test failed");
		} finally {
			setIsTestingBurst(false);
		}
	};

	const clearResults = () => {
		setTestResults([]);
	};

	const getResultBadgeVariant = (result: TestResult) => {
		if (result.success) return "default";
		if (result.status === 429) return "secondary";
		return "destructive";
	};

	const getResultStatusText = (result: TestResult) => {
		if (result.success) return "Success";
		if (result.status === 429) return "Rate Limited";
		if (result.status === 0) return "Network Error";
		return `Error ${result.status}`;
	};

	return (
		<div className="container mx-auto p-6 max-w-6xl">
			<div className="mb-6">
				<h1 className="text-3xl font-bold mb-2">Rate Limit Testing</h1>
				<p className="text-muted-foreground">
					Test the API rate limiting functionality with real requests.
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Test Controls */}
				<div className="lg:col-span-2 space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<TestTube className="h-5 w-5" />
								Test Controls
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="endpoint">Test Endpoint</Label>
								<Input
									id="endpoint"
									value={testEndpoint}
									onChange={(e) => setTestEndpoint(e.target.value)}
									placeholder="/relationships"
								/>
							</div>

							<div className="flex gap-2">
								<Button
									onClick={handleSingleRequest}
									disabled={isTesting || isTestingBurst}
									className="flex-1"
								>
									{isTesting ? (
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									) : (
										<Send className="h-4 w-4 mr-2" />
									)}
									Single Request
								</Button>

								<Button
									onClick={handleBurstTest}
									disabled={isTesting || isTestingBurst}
									variant="secondary"
									className="flex-1"
								>
									{isTestingBurst ? (
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									) : (
										<TestTube className="h-4 w-4 mr-2" />
									)}
									Burst Test (15 requests)
								</Button>
							</div>

							{testResults.length > 0 && (
								<Button
									onClick={clearResults}
									variant="outline"
									size="sm"
									className="w-full"
								>
									Clear Results
								</Button>
							)}
						</CardContent>
					</Card>

					{/* Test Results */}
					{testResults.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle>Test Results ({testResults.length})</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2 max-h-96 overflow-y-auto">
									{testResults.map((result, index) => (
										<div
											key={index}
											className="flex items-center justify-between p-3 border rounded-lg"
										>
											<div className="flex items-center gap-3">
												<Badge variant={getResultBadgeVariant(result)}>
													{getResultStatusText(result)}
												</Badge>
												<div className="text-sm">
													<div className="font-mono">{result.endpoint}</div>
													<div className="text-muted-foreground">
														{result.timestamp.toLocaleTimeString()} •{" "}
														{result.duration}ms
													</div>
												</div>
											</div>
											{result.error && (
												<div className="text-sm text-red-600 max-w-xs truncate">
													{result.error}
												</div>
											)}
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}
				</div>

				{/* Rate Limit Monitor */}
				<div className="space-y-6">
					<RateLimitMonitor />

					<Card>
						<CardHeader>
							<CardTitle className="text-sm">Rate Limit Info</CardTitle>
						</CardHeader>
						<CardContent className="text-sm space-y-2">
							<div>
								<strong>Limit:</strong> 10 requests per 20 seconds
							</div>
							<div>
								<strong>Retry Logic:</strong> Exponential backoff with jitter
							</div>
							<div>
								<strong>Max Retries:</strong> 3 attempts
							</div>
							<div>
								<strong>Queue:</strong> Automatic request queuing when limited
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
