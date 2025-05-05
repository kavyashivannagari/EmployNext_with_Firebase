// src/Pages/LandingPage.jsx
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const LandingPage = ({ user, userRole }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} userRole={userRole} />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl font-bold mb-6">Find Your Dream Job Today</h1>
              <p className="text-xl mb-8">Connect with top employers and discover opportunities that match your skills and career goals.</p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {!user && (
                  <>
                    <Link to="/signup" className="bg-white text-blue-600 px-6 py-3 rounded-md font-semibold hover:bg-blue-50 transition">
                      Sign Up
                    </Link>
                    <Link to="/login" className="bg-transparent border-2 border-white px-6 py-3 rounded-md font-semibold hover:bg-white/10 transition">
                      Log In
                    </Link>
                  </>
                )}
                
                <Link to="/jobs" className="bg-green-500 text-white px-6 py-3 rounded-md font-semibold hover:bg-green-600 transition">
                  Browse Jobs
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Platform</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Curated Job Listings</h3>
                <p className="text-gray-600 dark:text-gray-300">Access thousands of verified job opportunities from top companies across industries.</p>
              </div>
              
              <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Easy Application Process</h3>
                <p className="text-gray-600 dark:text-gray-300">Apply to multiple jobs with just a few clicks using your saved profile and resume.</p>
              </div>
              
              <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Direct Communication</h3>
                <p className="text-gray-600 dark:text-gray-300">Connect directly with recruiters and hiring managers through our secure messaging system.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-blue-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Take the Next Step in Your Career?</h2>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user ? (
                <Link to="/signup" className="bg-white text-blue-600 px-8 py-3 rounded-md font-semibold hover:bg-blue-50 transition">
                  Create Your Account Now
                </Link>
              ) : (
                <Link to={userRole === 'recruiter' ? '/postjob' : '/jobs'} className="bg-white text-blue-600 px-8 py-3 rounded-md font-semibold hover:bg-blue-50 transition">
                  {userRole === 'recruiter' ? 'Post a Job' : 'Find Jobs'}
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default LandingPage;