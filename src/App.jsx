import { useState } from 'react'
import { Theme } from '@radix-ui/themes'
import { PlusIcon } from '@radix-ui/react-icons'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Theme>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Legacy In Order
          </h1>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <button
              onClick={() => setCount((count) => count + 1)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Count is {count}
            </button>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Edit <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">src/App.jsx</code> and save to test HMR
            </p>
          </div>
        </div>
      </div>
    </Theme>
  )
}

export default App 