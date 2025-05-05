import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  auth, 
  getJobs, 
  isJobSaved, 
  saveJob, 
  unsaveJob, 
  applyToJob, 
  getUserProfile, 
  getUserRole,
  getUserApplications,
  cancelApplication,
  uploadResume
} from '../lib/firebase';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Briefcase, MapPin, DollarSign, Clock, Search, BookmarkPlus, BookmarkCheck, X } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import ApplyModal from '../components/ApplicationModal';

const JobListing = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [savedJobIds, setSavedJobIds] = useState({});
  const [user, setUser] = useState(null);
  const [appliedJobIds, setAppliedJobIds] = useState({});
  const [applicationIds, setApplicationIds] = useState({});
  const [alert, setAlert] = useState(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsData = await getJobs();
        // Normalize job data to ensure requirements is always an array
        const normalizedJobs = jobsData.map(job => ({
          ...job,
          requirements: Array.isArray(job.requirements) 
            ? job.requirements.filter(r => r) // Remove empty items
            : job.requirements 
              ? [job.requirements.toString()] // Convert to array if it's a single value
              : [] // Default to empty array
        }));
        
        setJobs(normalizedJobs);
        
        if (user) {
          try {
            const applications = await getUserApplications(user.uid);
            const appliedStatuses = {};
            const appIds = {};
            
            applications.forEach(app => {
              appliedStatuses[app.jobId] = true;
              appIds[app.jobId] = app.id;
            });
            
            const savedStatuses = {};
            for (const job of normalizedJobs) {
              try {
                const isSaved = await isJobSaved(user.uid, job.id);
                savedStatuses[job.id] = isSaved;
              } catch (err) {
                console.error(`Error checking saved status for job ${job.id}:`, err);
                savedStatuses[job.id] = false;
              }
            }
            
            setSavedJobIds(savedStatuses);
            setAppliedJobIds(appliedStatuses);
            setApplicationIds(appIds);
          } catch (err) {
            console.error("Error fetching user-specific data:", err);
            setSavedJobIds({});
            setAppliedJobIds({});
            setApplicationIds({});
          }
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError(err.message || "Failed to load jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setSavedJobIds({});
        setAppliedJobIds({});
        setApplicationIds({});
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      if (applyModalOpen && user) {
        try {
          const profileData = await getUserProfile(user.uid);
          setProfile(profileData || {});
        } catch (err) {
          console.error("Error loading profile:", err);
          setProfile({});
        }
      }
    };
    loadProfile();
  }, [applyModalOpen, user]);

  const handleSaveJob = async (jobId) => {
    if (!user) {
      navigate('/login', { state: { from: '/jobs' } });
      return;
    }
    
    try {
      if (savedJobIds[jobId]) {
        await unsaveJob(user.uid, jobId);
        setSavedJobIds(prev => ({ ...prev, [jobId]: false }));
        setAlert({ type: 'success', message: 'Job removed from saved list' });
      } else {
        await saveJob(user.uid, jobId);
        setSavedJobIds(prev => ({ ...prev, [jobId]: true }));
        setAlert({ type: 'success', message: 'Job saved successfully' });
      }
    } catch (err) {
      console.error("Error saving/unsaving job:", err);
      setAlert({ 
        type: 'error', 
        message: err.code === 'permission-denied' 
          ? 'You do not have permission to save jobs. Please contact support.' 
          : 'Failed to save job. Please try again.'
      });
    }
  };
  const handleApplyClick = async (jobId) => {
    if (!user) {
      navigate('/login', { state: { from: `/jobs` } });
      return;
    }
    
    // Add role verification
    try {
      const role = await getUserRole(user.uid);
      if (role !== 'candidate') {
        setAlert({
          type: 'error',
          message: 'Only candidates can apply to jobs'
        });
        return;
      }
      
      setSelectedJobId(jobId);
      setApplyModalOpen(true);
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Failed to verify your account type'
      });
      console.log(error)

    }
  };
  const handleApplicationSubmit = async (resumeFile, coverLetter = '') => {
    try {
      setLoading(true);
      setAlert(null); // Clear previous alerts
      
      if (!user) {
        navigate('/login');
        return;
      }
  
      // Verify candidate role first
      try {
        const role = await getUserRole(user.uid);
        if (role !== 'candidate') {
          throw new Error('Only candidates can apply to jobs');
        }
      } catch (roleError) {
        setAlert({
          type: 'error',
          message: 'Failed to verify your candidate status. Please try again or contact support.'
        });
        return;
      }
  
      let resumeUrl = profile?.resumeUrl;
      
      // Upload new resume if provided
      if (resumeFile) {
        try {
          resumeUrl = await uploadResume(user.uid, resumeFile);
        } catch (uploadError) {
          console.error('Resume upload failed:', uploadError);
          throw new Error('Failed to upload resume: ' + uploadError.message);
        }
      }
  
      // Validate we have a resume URL
      if (!resumeUrl) {
        throw new Error('A resume is required to apply for this position');
      }
  
      // Prepare application data
      const applicationData = {
        resumeUrl,
        coverLetter,
        candidateName: profile?.fullName || user.displayName || 'Applicant'
      };
  
      // Submit application
      const result = await applyToJob(user.uid, selectedJobId, applicationData);
      
      // Update UI state
      setAppliedJobIds(prev => ({ ...prev, [selectedJobId]: true }));
      setAlert({ 
        type: 'success', 
        message: 'Application submitted successfully!' 
      });
      
      // Refresh job data
      setJobs(jobs.map(job => 
        job.id === selectedJobId 
          ? { ...job, applicationCount: (job.applicationCount || 0) + 1 }
          : job
      ));
      
      setApplyModalOpen(false);
    } catch (error) {
      console.error('Application failed:', error);
      
      let userMessage = error.message;
      if (error.code === 'permission-denied') {
        userMessage = 'Application failed: You do not have permission to apply. Please ensure you are logged in as a candidate.';
      } else if (error.message.includes('already applied')) {
        userMessage = 'You have already applied to this position.';
      }
      
      setAlert({
        type: 'error',
        message: userMessage
      });
    } finally {
      setLoading(false);
    }
  };  const handleCancelApplication = async (jobId) => {
    try {
      const applicationId = applicationIds[jobId];
      if (!applicationId) {
        setAlert({ type: 'warning', message: 'No application found to cancel.' });
        return;
      }
      
      await cancelApplication(applicationId);
      setAppliedJobIds(prev => ({ ...prev, [jobId]: false }));
      setApplicationIds(prev => ({ ...prev, [jobId]: null }));
      setAlert({ type: 'success', message: 'Application cancelled successfully!' });

      setJobs(jobs.map(job => 
        job.id === jobId 
          ? { ...job, applicationCount: Math.max((job.applicationCount || 0) - 1, 0) }
          : job
      ));
    } catch (err) {
      console.error("Error cancelling application:", err);
      setAlert({ 
        type: 'error', 
        message: err.message || 'Failed to cancel application. Please try again.'
      });
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredJobs = jobs.filter(job => {
    const searchLower = searchTerm.toLowerCase();
    return (
      job.title?.toLowerCase().includes(searchLower) ||
      job.companyName?.toLowerCase().includes(searchLower) ||
      job.location?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-600 p-4 rounded-md">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-300">Error</h2>
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} userRole={user ? "candidate" : null} />
      
      <main className="flex-grow py-6 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
        {alert && (
  <Alert 
    variant={alert.type === 'error' ? 'destructive' : 'default'} 
    className="mb-4"
    onClose={() => setAlert(null)}
  >
    <AlertDescription className="flex items-center justify-between">
      <span>{alert.message}</span>
      <button 
        onClick={() => setAlert(null)}
        className="ml-4 hover:text-gray-700"
      >
        <X className="h-4 w-4" />
      </button>
    </AlertDescription>
  </Alert>
)}
          
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-4">Browse Jobs</h1>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search jobs by title, company or location..."
                className="pl-10"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
          
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No jobs found matching your search criteria.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredJobs.map(job => (
                <Card key={job.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h2 className="text-xl font-semibold">
                            <Link to={`/job/${job.id}`} className="hover:text-blue-600">
                              {job.title}
                            </Link>
                          </h2>
                          {user && (
                            <button 
                              onClick={() => handleSaveJob(job.id)}
                              className="ml-4 text-gray-500 hover:text-yellow-500"
                              aria-label={savedJobIds[job.id] ? "Unsave job" : "Save job"}
                            >
                              {savedJobIds[job.id] ? (
                                <BookmarkCheck className="h-5 w-5 text-yellow-500" />
                              ) : (
                                <BookmarkPlus className="h-5 w-5" />
                              )}
                            </button>
                          )}
                        </div>
                        
                        <h3 className="text-lg text-gray-700 dark:text-gray-300 mb-2">
                          {job.companyName}
                        </h3>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {job.location}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {job.minSalary}LPA- {job.maxSalary}LPA
                          </div>
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-1" />
                            {job.type}
                          </div>
                          {job.postedAt && (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              Posted {new Date(job.postedAt.seconds * 1000).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                          {job.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.requirements.slice(0, 3).map((req, index) => (
                            <span key={index} className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-xs">
                              {req}
                            </span>
                          ))}
                          {job.requirements.length > 3 && (
                            <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded text-xs">
                              +{job.requirements.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 md:items-end md:ml-6 mt-4 md:mt-0">
                        {appliedJobIds[job.id] ? (
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              className="text-green-700 border-green-700 hover:bg-green-50"
                              disabled
                            >
                              Applied
                            </Button>
                            <Button 
                              variant="outline" 
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => handleCancelApplication(job.id)}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            onClick={() => handleApplyClick(job.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Apply Now
                          </Button>
                        )}
                        <Link to={`/job/${job.id}`}>
                          <Button variant="outline">View Details</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <ApplyModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        profile={profile}
        onApply={handleApplicationSubmit}
        currentResumeUrl={profile?.resumeUrl}
      />
      
      <Footer />
    </div>
  );
};

export default JobListing;