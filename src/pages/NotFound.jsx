import { Home, AlertCircle } from 'lucide-react';

/**
 * 404 Not Found Page
 * Displayed when user navigates to an invalid route
 */
const NotFound = () => {
  const handleGoHome = () => {
    window.history.replaceState({}, '', '/');
    window.location.href = '/';
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md w-full">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-yellow-900/20 flex items-center justify-center">
            <AlertCircle size={40} className="text-yellow-500" />
          </div>
        </div>

        {/* Error Code */}
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00C2FF] to-[#0084FF] mb-2">
            404
          </h1>
          <p className="text-xl font-semibold text-gray-300">Page Not Found</p>
        </div>

        {/* Message */}
        <p className="text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
          Please check the URL and try again.
        </p>

        {/* Actions */}
        <div className="flex gap-3 flex-col sm:flex-row">
          <button
            onClick={handleGoBack}
            className="flex-1 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-gray-300 rounded-lg font-medium transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={handleGoHome}
            className="flex-1 px-4 py-3 bg-[#00C2FF]/10 hover:bg-[#00C2FF]/20 text-[#00C2FF] rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Home size={18} />
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
