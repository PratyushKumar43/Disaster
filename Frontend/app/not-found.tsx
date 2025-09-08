import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md mx-auto text-center px-6">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-indigo-600 dark:text-indigo-400">
            404
          </h1>
          <div className="text-6xl">🔍</div>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Page Not Found
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="space-y-4">
          <Link 
            href="/"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium"
          >
            Go Back Home
          </Link>
          
          <div className="flex justify-center space-x-4 text-sm">
            <Link 
              href="/dashboard"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Dashboard
            </Link>
            <Link 
              href="/health"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Health Check
            </Link>
          </div>
        </div>
        
        <div className="mt-8 text-xs text-gray-500 dark:text-gray-400">
          Disaster Management System
        </div>
      </div>
    </div>
  );
}
