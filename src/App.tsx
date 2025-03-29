import { useState } from "react";
import "./App.css";

function App(): JSX.Element {
	const [count, setCount] = useState<number>(0);

	return (
		<div className="app">
			<h1>Legacy In Order</h1>
			<div className="card">
				<button onClick={() => setCount((count) => count + 1)}>
					Count is {count}
				</button>
				<p>
					Edit <code>src/App.tsx</code> and save to test HMR
				</p>
			</div>
		</div>
	);
}

export default App;
