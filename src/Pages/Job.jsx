
import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { auth, applyToJob, getJobById, isJobSaved, saveJob, unsaveJob, getUserApplications } from '../lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bookmark, Briefcase, MapPin, DollarSign, Calendar } from 'lucide-react';

const JobPage = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [user, setUser] = useState(null);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [isApplied, setIsApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        checkSavedStatus(currentUser.uid);
        checkAppliedStatus(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobData = await getJobById(id);
        if (jobData) {
          setJob(jobData);
        } else {
          setError('Job not found');
        }
      } catch (err) {
        setError('Error fetching job details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const checkSavedStatus = async (userId) => {
    try {
      const saved = await isJobSaved(userId, id);
      setIsSaved(saved);
    } catch (err) {
      console.error('Error checking saved status:', err);
    }
  };

  const checkAppliedStatus = async (userId) => {
    try {
      const applications = await getUserApplications(userId);
      const applied = applications.some(app => app.jobId === id);
      setIsApplied(applied);
    } catch (err) {
      console.error('Error checking application status:', err);
    }
  };

  const toggleSaveJob = async () => {
    if (!user) {
      return <Navigate to="/login" state={{ from: `/jobs/${id}` }} />;
    }

    try {
      if (isSaved) {
        await unsaveJob(user.uid, id);
        setIsSaved(false);
      } else {
        await saveJob(user.uid, id);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Error updating saved jobs:', err);
    }
  };
console.log(isApplied)
console.log(isApplying)
  const handleApply = async () => {
    if (!user) {
      return <Navigate to="/login" state={{ from: `/jobs/${id}` }} />;
    }

    setIsApplying(true);
    setApplyError('');

    try {
      await applyToJob(user.uid, id);
      setIsApplied(true);
      setApplySuccess(true);
      setTimeout(() => setApplySuccess(false), 3000);
    } catch (err) {
      setApplyError('Failed to apply. Please try again.');
      console.error('Error applying to job:', err);
    } finally {
      setIsApplying(false);
    }
  };
  console.log('handleApply function is defined:', !!handleApply);


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500">{error}</h2>
          <Link to="/jobs" className="text-blue-500 hover:underline mt-4 inline-block">
            Back to Job Listings
          </Link>
        </div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="container mx-auto px-4 py-10">
      <Link to="/jobs" className="text-blue-500 hover:underline mb-6 inline-block">
        &larr; Back to Job Listings
      </Link>
      
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">{job.title}</CardTitle>
              <CardDescription className="text-xl mt-2">{job.company}</CardDescription>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </Badge>
                {/* <Badge variant="secondary" className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {job.salary}
                </Badge> */}
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button
                variant={isSaved ? "outline" : "secondary"}
                onClick={toggleSaveJob}
                className="flex items-center gap-2"
              >
                <Bookmark className="h-4 w-4" />
                {isSaved ? "Saved" : "Save"}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {applySuccess && (
            <Alert className="mb-6 bg-green-50 dark:bg-green-900/20 border-green-600">
              <AlertDescription className="text-green-800 dark:text-green-300">
                Application submitted successfully!
              </AlertDescription>
            </Alert>
          )}
          
          {applyError && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{applyError}</AlertDescription>
            </Alert>
          )}
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Job Description</h3>
            <p className="whitespace-pre-line">{job.description}</p>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Requirements</h3>
            <ul className="list-disc ml-5 space-y-1">
              {job.requirements?.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
          
          {job.benefits?.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-2">Benefits</h3>
              <ul className="list-disc ml-5 space-y-1">
                {job.benefits?.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="border-t pt-6">
          <div className="w-full flex justify-between items-center">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Posted on {new Date(job.postedDate?.toDate()).toLocaleDateString()}
            </div>
            
            {/* <Button 
              onClick={handleApply}
              disabled={isApplying || isApplied}
              className={`flex items-center gap-2 ${
                isApplied ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <Briefcase className="h-4 w-4" />
              {isApplied ? 'Applied' : isApplying ? 'Applying...' : 'Apply Now'}
            </Button> */}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default JobPage;