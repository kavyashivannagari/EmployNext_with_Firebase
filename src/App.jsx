import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ThemeProvider } from "./components/themeProvider";
import { auth, getUserRole } from './lib/firebase';
import { useEffect, useState } from 'react';
import LandingPage from "./Pages/LandingPage";
import CandidateDashboard from './Pages/CandidateDashboard';
import CandidateProfile from './components/CandidateProfile';
import RecruiterDashboard from './Pages/RecruiterDashboard';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import JobPage from './pages/Job';
import JobListing from './pages/JobListing';
import PostJob from './Pages/PostJob';
import SavedJobs from './Pages/SaveJob';
import MyJobs from './Pages/MyJob';
import RecruiterProfile from './components/RecruiterProfile';
import { Loader2 } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuestUser, setIsGuestUser] = useState(false);
  const [guestRole, setGuestRole] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        
        const guestStatus = sessionStorage.getItem('isGuest');
        if (guestStatus) {
          setIsGuestUser(true);
          setGuestRole(guestStatus);
          setUserRole(guestStatus);
        } else {
          try {
            const role = await getUserRole(user.uid);
            setUserRole(role || 'candidate');
            setIsGuestUser(false);
          } catch (error) {
            console.error("Error fetching user role:", error);
            setUserRole('candidate');
          }
        }
      } else {
        setUser(null);
        setUserRole(null);
        setIsGuestUser(false);
        sessionStorage.removeItem('isGuest');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const router = createBrowserRouter([
    {
      path: '/',
      element: <LandingPage user={user} userRole={userRole} />,
    },
    {
      path: "/login",
      element: user ? (
        isGuestUser ? (
          guestRole === 'recruiter' ? (
            <Navigate to="/recruiter-dashboard" replace />
          ) : (
            <Navigate to="/candidate-dashboard" replace />
          )
        ) : userRole === 'recruiter' ? (
          <Navigate to="/recruiter-dashboard" replace />
        ) : (
          <Navigate to="/candidate-dashboard" replace />
        )
      ) : (
        <LoginPage />
      ),
    },
    {
      path: '/signup',
      element: user ? <LoginPage /> : <SignupPage />,
    },
    // Candidate Routes
    {
      path: '/candidate-dashboard',
      element: (
        <ProtectedRoute>
          <RoleBasedRoute allowedRoles={['candidate']} userRole={userRole}>
            <CandidateDashboard isGuest={isGuestUser} />
          </RoleBasedRoute>
        </ProtectedRoute>
      ),
    },
    {
      path: '/candidate-profile',
      element: (
        <ProtectedRoute>
          <RoleBasedRoute allowedRoles={['candidate']} userRole={userRole}>
            <CandidateProfile />
          </RoleBasedRoute>
        </ProtectedRoute>
      ),
    },
    // Recruiter Routes
    {
      path: '/recruiter-dashboard',
      element: (
        <ProtectedRoute>
          <RoleBasedRoute allowedRoles={['recruiter']} userRole={userRole}>
            <RecruiterDashboard isGuest={isGuestUser} />
          </RoleBasedRoute>
        </ProtectedRoute>
      ),
    },
    {
      path: '/recruiter-profile',
      element: (
        <ProtectedRoute>
          <RoleBasedRoute allowedRoles={['recruiter']} userRole={userRole}>
            <RecruiterProfile />
          </RoleBasedRoute>
        </ProtectedRoute>
      ),
    },
    // Shared Routes
    {
      path: '/job/:id',
      element: <JobPage isGuest={isGuestUser} />,
    },
    {
      path: '/jobs',
      element: <JobListing />,
    },
    {
      path: '/postjob',
      element: (
        <ProtectedRoute>
          <RoleBasedRoute allowedRoles={['recruiter']} userRole={userRole}>
            <PostJob />
          </RoleBasedRoute>
        </ProtectedRoute>
      ),
    },
    {
      path: '/savedjobs',
      element: (
        <ProtectedRoute>
          <RoleBasedRoute allowedRoles={['candidate']} userRole={userRole}>
            <SavedJobs />
          </RoleBasedRoute>
        </ProtectedRoute>
      ),
    },
    {
      path: '/myjobs',
      element: (
        <ProtectedRoute>
          <MyJobs isGuest={isGuestUser && guestRole === 'recruiter'} />
        </ProtectedRoute>
      ),
    },
    // Fallback Route
    {
      path: '*',
      element: <Navigate to="/" replace />,
    },
  ]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;