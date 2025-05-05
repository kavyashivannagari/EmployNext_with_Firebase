import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, getJobsByRecruiter, getUserRole,deleteJob  } from '../lib/firebase';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { Loader2 } from 'lucide-react';

const MyJobs = ({ isGuest }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [postedJobs, setPostedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        navigate('/login');
        return;
      }
      
      try {
        if (isGuest) {
          setUserRole('recruiter');
          loadGuestJobs();
          return;
        }

        const role = await getUserRole(currentUser.uid);
        setUserRole(role);
        
        if (role === 'recruiter') {
          fetchPostedJobs(currentUser.uid);
        } else if (role === 'candidate') {
          fetchAppliedJobs(currentUser.uid);
        }
      } catch (error) {
        console.error('Error:', error);
        setAlert({ type: 'error', message: error.message || 'Failed to load data' });
      }
    };
    
    checkAuth();
  }, [navigate, isGuest]);

  const loadGuestJobs = () => {
    setPostedJobs([
      {
        id: 'demo1',
        title: 'Senior Frontend Developer',
        companyName: 'Demo Company',
        location: 'Remote',
        type: 'Full-time',
        minSalary: 90000,
        maxSalary: 120000,
        postedAt: { seconds: Date.now() / 1000 - 86400 },
        applications: Array(5).fill({ status: 'pending' }),
        active: true
      },
      {
        id: 'demo2',
        title: 'UX Designer',
        companyName: 'Demo Company',
        location: 'Hybrid',
        type: 'Contract',
        minSalary: 70000,
        maxSalary: 90000,
        postedAt: { seconds: Date.now() / 1000 - 172800 },
        applications: Array(3).fill({ status: 'pending' }).concat({ status: 'interview' }),
        active: true
      }
    ]);
    setLoading(false);
  };

  const fetchPostedJobs = async (userId) => {
    try {
      setLoading(true);
      const jobsData = await getJobsByRecruiter(userId);
      setPostedJobs(jobsData);
    } catch (error) {
      console.error('Error fetching posted jobs:', error);
      setAlert({ type: 'error', message: error.message || 'Failed to fetch jobs' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAppliedJobs = async (userId) => {
    try {
      setLoading(true);
      // Implement candidate's applied jobs logic here
      // This is just a placeholder - replace with your actual implementation
      console.log(userId)
      setAppliedJobs([]);
    } catch (error) {
      console.error('Error fetching applied jobs:', error);
      setAlert({ type: 'error', message: error.message || 'Failed to fetch applications' });
    } finally {
      setLoading(false);
    }
  };
  const toggleJobActiveStatus = async (jobId, currentStatus) => {
    try {
      // Implement job status toggle logic here
      // For demo purposes, we'll just update local state
      setPostedJobs(postedJobs.map(job => 
        job.id === jobId ? { ...job, active: !currentStatus } : job
      ));
    } catch (error) {
      console.error('Error updating job status:', error);
      setAlert({ type: 'error', message: error.message || 'Failed to update job status' });
    }
  };

  const openDeleteDialog = (job) => {
    if (isGuest) {
      setAlert({ type: 'error', message: 'Guest users cannot delete jobs' });
      return;
    }
    setJobToDelete(job);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteJob = async () => {
    if (!jobToDelete) return;
    
    try {
      await deleteJob(jobToDelete.id);
      
      setPostedJobs(prevJobs => prevJobs.filter(job => job.id !== jobToDelete.id));
      setAlert({ type: 'success', message: 'Job deleted successfully' });
    } catch (error) {
      console.error('Error deleting job:', error);
      
      let errorMessage = error.message;
      if (error.code === 'permission-denied') {
        errorMessage = "You don't have permission to delete this job. Please make sure:";
        errorMessage += "\n- You're logged in as the recruiter who posted this job";
        errorMessage += "\n- Your account has recruiter privileges";
      }
      
      setAlert({ 
        type: 'error', 
        message: errorMessage,
        duration: 5000 // Show for 5 seconds
      });
    } finally {
      setDeleteDialogOpen(false);
      setJobToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Jobs</h1>
        
        {alert && (
          <Alert variant={alert.type === 'error' ? 'destructive' : 'default'} className="mb-6">
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        {isGuest && (
          <Alert className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400">
            <AlertDescription className="text-yellow-800 dark:text-yellow-300">
              You are using a guest account. Some features are limited. {' '}
              <Link to="/signup" className="font-semibold hover:underline">
                Sign up
              </Link> for full access.
            </AlertDescription>
          </Alert>
        )}

        {userRole === 'recruiter' ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-muted-foreground">Manage your posted job listings</p>
              {!isGuest && (
                <Link to="/postjob">
                  <Button>Post New Job</Button>
                </Link>
              )}
            </div>
            
            {postedJobs.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No jobs posted yet</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-10">
                  <p className="text-muted-foreground mb-4">
                    {isGuest ? 'Demo job listings will appear here' : 'You haven\'t posted any jobs yet.'}
                  </p>
                  {!isGuest && (
                    <Link to="/postjob">
                      <Button>Post Your First Job</Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Tabs defaultValue="active">
                <TabsList className="mb-6">
                  {/* <TabsTrigger value="active">Active Jobs</TabsTrigger>
                  <TabsTrigger value="inactive">Inactive Jobs</TabsTrigger> */}
                  <TabsTrigger value="all">All Jobs</TabsTrigger>
                </TabsList>
                
                <TabsContent value="active">
                  <div className="space-y-4">
                    {postedJobs.filter(job => job.active).map(job => (
                      <RecruiterJobCard 
                        key={job.id} 
                        job={job} 
                        isGuest={isGuest}
                        onToggleStatus={toggleJobActiveStatus}
                        onDelete={openDeleteDialog}
                      />
                    ))}
                    {postedJobs.filter(job => job.active).length === 0 && (
                      <p className="text-center py-4 text-muted-foreground">No active jobs found</p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="inactive">
                  <div className="space-y-4">
                    {postedJobs.filter(job => !job.active).map(job => (
                      <RecruiterJobCard 
                        key={job.id} 
                        job={job} 
                        isGuest={isGuest}
                        onToggleStatus={toggleJobActiveStatus}
                        onDelete={openDeleteDialog}
                      />
                    ))}
                    {postedJobs.filter(job => !job.active).length === 0 && (
                      <p className="text-center py-4 text-muted-foreground">No inactive jobs found</p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="all">
                  <div className="space-y-4">
                    {postedJobs.map(job => (
                      <RecruiterJobCard 
                        key={job.id} 
                        job={job} 
                        isGuest={isGuest}
                        onToggleStatus={toggleJobActiveStatus}
                        onDelete={openDeleteDialog}
                      />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </>
        ) : (
          // Candidate view
          <>
            <p className="text-muted-foreground mb-6">Track your job applications</p>
            
            {appliedJobs.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No applications yet</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-10">
                  <p className="text-muted-foreground mb-4">
                    Start applying for jobs to track your applications here.
                  </p>
                  <Link to="/jobs">
                    <Button>Browse Jobs</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {appliedJobs.map(job => (
                  <CandidateJobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{jobToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteJob}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Job Card Components
const RecruiterJobCard = ({ job, isGuest, onToggleStatus, onDelete }) => {
  const postedDate = job.postedAt ? new Date(job.postedAt.seconds * 1000).toLocaleDateString() : 'N/A';
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-xl">{job.title}</h3>
            <p className="text-muted-foreground">{job.companyName}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge>{job.location}</Badge>
              <Badge variant="outline">{job.type}</Badge>
              {job.active ? (
                <Badge variant="success">Active</Badge>
              ) : (
                <Badge variant="destructive">Inactive</Badge>
              )}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Posted: {postedDate}
            <div className="mt-1">
              <Badge variant="outline">
                {job.applications?.length || 0} Applicant{job.applications?.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4 flex justify-between">
        <div className="flex gap-2">
          <Link to={`/job/${job.id}`}>
            <Button variant="ghost">View Details</Button>
          </Link>
          {!isGuest && (
            <Link to={`/job/${job.id}/edit`}>
              <Button variant="outline">Edit</Button>
            </Link>
          )}
        </div>
        {!isGuest && (
          <div className="flex gap-2">
            <Button 
              variant={job.active ? "destructive" : "outline"} 
              onClick={() => onToggleStatus(job.id, job.active)}
            >
              {job.active ? 'Deactivate' : 'Activate'}
            </Button>
            <Button 
              variant="ghost" 
              className="text-red-500 hover:text-red-700"
              onClick={() => onDelete(job)}
            >
              Delete
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

const CandidateJobCard = ({ job }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-xl">{job.title}</h3>
            <p className="text-muted-foreground">{job.companyName}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge>{job.location}</Badge>
              <Badge variant="outline">{job.type}</Badge>
              <Badge variant="secondary">Pending</Badge>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Applied: {job.appliedDate || 'N/A'}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4">
        <Link to={`/job/${job.id}`}>
          <Button variant="ghost">View Job</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default MyJobs;