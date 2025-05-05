import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerWithEmailAndPasswordWithRole } from '../lib/firebase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function SignupPage() {
  const navigate = useNavigate()
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("candidate");
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (title, message, type = 'error') => {
    setNotification({ title, message, type });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      if (!role || role === "I am a.." || role === "Select Role") {
        throw new Error("Please select a valid role");
      }
  
      await registerWithEmailAndPasswordWithRole(name, email, password, role);
  
      showNotification('Registration successful!', 'Please log in with your credentials.', 'success');
      // Remove the onSuccess callback and directly navigate to login
      navigate('/login');
  
    } catch (error) {
      console.error("Registration error:", error);
      showNotification('Registration failed', error.message.replace("Firebase: ", ""));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg max-w-md z-50 flex items-start gap-3 ${notification.type === 'success' ? 'bg-green-900/90 text-green-100 border border-green-700' : 'bg-red-900/90 text-red-100 border border-red-700'
          } backdrop-blur-sm`}>
          {notification.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-300 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-300 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <h3 className="font-medium">{notification.title}</h3>
            <p className="text-sm opacity-90">{notification.message}</p>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="ml-auto flex-shrink-0 text-gray-300 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </div>
            </div>
            <h2 className="mt-4 text-3xl font-bold text-white">Create Your Account</h2>
            <p className="mt-2 text-sm text-gray-300">
              Join our platform and start your journey today
            </p>
          </div>

          <div className="mt-10">
            <div className="mt-6">
              <form onSubmit={handleSignup} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="block text-sm font-medium text-gray-300">
                    Full Name
                  </Label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 right-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-10 rounded-md border border-gray-700 bg-gray-800 px-3 py-2 placeholder-gray-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="block text-sm font-medium text-gray-300">
                    Email address
                  </Label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 right-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 rounded-md border border-gray-700 bg-gray-800 px-3 py-2 placeholder-gray-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="block text-sm font-medium text-gray-300">
                    Password
                  </Label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 right-1 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 rounded-md border border-gray-700 bg-gray-800 px-3 py-2 placeholder-gray-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm text-white"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    Use at least 8 characters with a mix of letters, numbers & symbols
                  </p>
                </div>

                <div>
                  <Label htmlFor="role" className="block text-sm font-medium text-gray-300">
                    I am a...
                  </Label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <select
                      id="role"
                      name="role"
                      required
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="block w-full pl-10 rounded-md border border-gray-700 bg-gray-800 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm text-white appearance-none"
                    >
                      <option value="candidate">Candidate</option>
                      <option value="recruiter">Recruiter</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full justify-center rounded-md border border-transparent bg-gradient-to-r from-blue-600 to-blue-500 py-3 px-4 text-sm font-medium text-white shadow-lg hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Sign up'
                    )}
                  </Button>
                </div>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-900 text-gray-400">Already have an account?</span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    to="/login"
                    className="flex w-full justify-center rounded-md border border-gray-700 bg-gray-800 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                  >
                    Sign in to existing account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 h-full w-full">
          <img
            className="h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-1.2.1&auto=format&fit=crop&w=1908&q=80"
            alt="Team collaboration"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-90" />
        </div>
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "Talent wins games, but teamwork and intelligence win championships."
            </p>
            <footer className="text-sm text-gray-300">— Michael Jordan</footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}