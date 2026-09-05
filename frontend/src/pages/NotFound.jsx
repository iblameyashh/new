import { Link } from 'react-router-dom';
import { Home, BookOpen } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-8xl font-black text-primary mb-2">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition shadow"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <Link
            to="/courses"
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Browse Courses
          </Link>
        </div>
      </div>
    </div>
  );
}
