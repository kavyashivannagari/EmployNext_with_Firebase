import { Link, useNavigate } from 'react-router-dom';
import { logoutUser } from "../lib/firebase";
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function Header({ user, userRole, isGuest }) {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleProfileClick = () => {
    if (userRole === 'recruiter') {
      navigate('/recruiter-dashboard');
    } else if (userRole === 'candidate') {
      navigate('/candidate-dashboard');
    }
  };

  // Use the isGuest prop passed from parent component
  const isGuestRecruiter = isGuest && userRole === 'recruiter';

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              EmployNext
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {/* Show only for logged-in recruiters except guest */}
            {user && userRole === 'recruiter' && !isGuestRecruiter && (
              <Link
                to="/postjob"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                Post Job
              </Link>
            )}

            <Link
              to="/about"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              About Us
            </Link>
          </nav>

          {/* Right Side - Auth Buttons / User Info */}
          <div className="flex items-center space-x-4">
            {isLoggingOut ? (
              <div className="px-4 py-2">
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              </div>
            ) : user ? (
              <>
                <div className="hidden md:flex items-center space-x-2">
                  <button
                    onClick={handleProfileClick}
                    title="Go to Dashboard"
                    className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded-lg transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-medium">
                      {user.displayName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-gray-700 dark:text-gray-200">
                      {user.displayName || 'User'}
                    </span>
                  </button>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 rounded-lg shadow transition"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
