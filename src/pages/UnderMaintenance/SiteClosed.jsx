import { FaLock } from "react-icons/fa";

export const SiteClosed = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-red-100 dark:bg-red-900/20 rounded-full mb-6">
            <FaLock className="w-16 h-16 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Main Content */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Site Closed
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-6">
            This site is no longer available.
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4 max-w-lg mx-auto">
            Access to this website has been permanently closed. If you have any
            questions, please contact the site administrator.
          </p>
        </div>
      </div>
    </div>
  );
};
