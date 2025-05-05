import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, getUserProfile, getJobsByRecruiter, createUserProfile, deleteJob } from '../lib/firebase';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import PostJobModal from '../components/PostModal';
import RecruiterProfileModal from '../components/RecruiterProfile';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { X } from 'lucide-react';

const JobItem = ({ job, onDelete, isGuest }) => {
  const postedDate = job.postedAt && new Date(job.postedAt.seconds * 1000).toLocaleDateString();
  const applicationsCount = job.applications?.length || 0;

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{job.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{job.companyName} • {job.location}</p>
              </div>
              {!isGuest && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => onDelete(job.id)}
                  className="ml-4"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="flex gap-2 mt-2">
              <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded">
                {job.type}
              </span>
              <span className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded">
                ${job.minSalary} - ${job.maxSalary}
              </span>
            </div>
          </div>
          
          <div className="mt-2 md:mt-0 md:text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">Posted: {postedDate || 'N/A'}</p>
            <p className="text-sm mt-1">
              <span className="font-bold">{applicationsCount}</span> application{applicationsCount !== 1 && 's'}
            </p>
            <Link 
              to={`/job/${job.id}`} 
              className="text-blue-600 dark:text-blue-400 text-sm hover:underline inline-block mt-2"
            >
              View Details
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const RecruiterDashboard = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();
  
  // Check sessionStorage for guest status
  const isGuest = sessionStorage.getItem('isGuest') === 'recruiter';

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (isGuest) {
          // Load demo data for guest recruiters
          console.log('Loading guest recruiter data');
          setUserProfile({
            fullName: "Guest Recruiter",
            companyName: "Demo Company",
            position: "HR Manager",
            location: "Remote",
            industry: "Technology",
            companyWebsite: "",
            companyDescription: "Guest account for demo purposes"
          });
          
          setJobs([
            {
              id: 'demo1',
              title: 'Senior Frontend Developer',
              companyName: 'Demo Company',
              location: 'Remote',
              type: 'Full-time',
              minSalary: 90000,
              maxSalary: 120000,
              postedAt: { seconds: Date.now() / 1000 - 86400 }, // 1 day ago
              applications: Array(5).fill({ status: 'pending' })
            },
            {
              id: 'demo2',
              title: 'UX Designer',
              companyName: 'Demo Company',
              location: 'Hybrid',
              type: 'Contract',
              minSalary: 70000,
              maxSalary: 90000,
              postedAt: { seconds: Date.now() / 1000 - 172800 }, // 2 days ago
              applications: Array(3).fill({ status: 'pending' }).concat({ status: 'interview' })
            }
          ]);
          setLoading(false);
          return;
        }
        
        // Regular user flow
        const user = auth.currentUser;
        if (!user) {
          console.log('No user found, redirecting to login');
          navigate('/login');
          return;
        }

        try {
          const profileData = await getUserProfile(user.uid);
          setUserProfile(profileData);
        } catch (error) {
          if (error.message === "Profile not found") {
            const defaultProfile = {
              fullName: user.displayName || '',
              companyName: '',
              position: '',
              location: '',
              industry: '',
              companyWebsite: '',
              companyDescription: ''
            };
            await createUserProfile(user.uid, defaultProfile);
            setUserProfile(defaultProfile);
          } else {
            throw error;
          }
        }

        const jobsData = await getJobsByRecruiter(user.uid);
        setJobs(jobsData);
      } catch (error) {
        console.error('Error loading user data:', error);
        setAlert({ type: 'error', message: error.message || 'Failed to load data' });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [isGuest, navigate]);

  const openPostJobModal = () => {
    if (isGuest) {
      setAlert({
        type: 'error',
        message: 'Guest users cannot post jobs. Please sign up for a full account.'
      });
      return;
    }
    setIsModalOpen(true);
  };

  const closePostJobModal = () => {
    setIsModalOpen(false);
    if (auth.currentUser) {
      getJobsByRecruiter(auth.currentUser.uid).then(jobsData => {
        setJobs(jobsData);
      });
    }
  };

  const handleProfileUpdate = (updatedProfile) => {
    setUserProfile(updatedProfile);
  };

  const handleDeleteJob = async (jobId) => {
    try {
      if (isGuest) {
        throw new Error("Guest users cannot delete jobs");
      }
  
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Authentication required");
      }
  
      if (!window.confirm("Are you sure you want to delete this job posting?")) {
        return;
      }
  
      await deleteJob(jobId);
      
      // Update state immediately
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
      
      setAlert({ type: 'success', message: 'Job deleted successfully' });
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      console.error('Error deleting job:', error);
      let errorMessage = error.message;
      if (error.code === 'permission-denied') {
        errorMessage = "You don't have permission to delete this job";
      }
      setAlert({ type: 'error', message: errorMessage });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const profileData = userProfile || {
    fullName: '',
    companyName: '',
    position: '',
    location: '',
    industry: '',
    companyWebsite: '',
    companyDescription: ''
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={auth.currentUser} userRole="recruiter" isGuest={isGuest} />
      
      <main className="flex-grow py-6 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          {alert && (
            <Alert variant={alert.type === 'error' ? 'destructive' : 'default'} className="mb-4">
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          )}
          
          {isGuest && (
            <Alert className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400">
              <AlertDescription className="text-yellow-800 dark:text-yellow-300">
                You are using a guest account. Some features are limited. {' '}
                <Link to="/signup" className="font-semibold hover:underline">
                  Sign up
                </Link> for full access.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Company Profile Section */}
            <div className="md:w-1/3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Company Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600 dark:text-blue-300">
                      {profileData.companyName?.charAt(0).toUpperCase() || 'C'}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{profileData.companyName || 'Company'}</h2>
                      <p className="text-gray-600 dark:text-gray-400">{profileData.industry || 'Industry'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Recruiter</h3>
                      <p>{profileData.fullName || 'Not specified'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{profileData.position || 'Position'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Location</h3>
                      <p>{profileData.location || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Website</h3>
                      <a 
                        href={profileData.companyWebsite} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {profileData.companyWebsite || 'Not specified'}
                      </a>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">About</h3>
                      <p className="text-sm">{profileData.companyDescription || 'No description provided'}</p>
                    </div>
                  </div>
                  
                  {!isGuest && (
                    <div className="mt-4">
                      <button
                        onClick={() => setIsProfileModalOpen(true)}
                        className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                      >
                        Edit Profile
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <div className="mt-6 grid grid-cols-1 gap-4">
                <button 
                  onClick={openPostJobModal}
                  className={`${isGuest ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white p-4 rounded text-center transition-colors`}
                  disabled={isGuest}
                >
                  {isGuest ? 'Posting Disabled for Guests' : 'Post New Job'}
                </button>
              </div>
            </div>
            
            {/* Dashboard Content */}
            <div className="md:w-2/3">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Dashboard Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded">
                      <h3 className="text-lg font-semibold">{jobs.length}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Active Job Listings</p>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded">
                      <h3 className="text-lg font-semibold">
                        {jobs.reduce((sum, job) => sum + (job.applications?.length || 0), 0)}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Applications</p>
                    </div>
                    
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded">
                      <h3 className="text-lg font-semibold">
                        {jobs.reduce((sum, job) => {
                          const interviewCount = job.applications?.filter(app => app.status === 'interview')?.length || 0;
                          return sum + interviewCount;
                        }, 0)}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Interview Stage</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Your Job Listings</CardTitle>
                  <Link to="/myjobs" className="text-blue-600 dark:text-blue-400 text-sm hover:underline">
                    View All
                  </Link>
                </CardHeader>
                <CardContent>
                  {jobs.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">
                        {isGuest ? 'Demo job listings will appear here' : 'You haven\'t posted any jobs yet.'}
                      </p>
                      {!isGuest && (
                        <button 
                          onClick={openPostJobModal}
                          className="text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block"
                        >
                          Post Your First Job
                        </button>
                      )}
                    </div>
                  ) : (
                    <div>
                      {jobs.slice(0, 3).map((job) => (
                        <JobItem 
                          key={job.id} 
                          job={job} 
                          onDelete={handleDeleteJob}
                          isGuest={isGuest}
                        />
                      ))}
                      
                      {jobs.length > 3 && (
                        <div className="text-center mt-4">
                          <Link to="/myjobs" className="text-blue-600 dark:text-blue-400 hover:underline">
                            View {jobs.length - 3} more job{jobs.length - 3 !== 1 && 's'}
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      {isModalOpen && <PostJobModal isOpen={isModalOpen} onClose={closePostJobModal} />}
      {isProfileModalOpen && (
        <RecruiterProfileModal 
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onProfileUpdate={handleProfileUpdate}
          initialProfile={profileData}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default RecruiterDashboard;