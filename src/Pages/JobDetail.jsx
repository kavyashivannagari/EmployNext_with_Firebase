import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { auth, getJobById, isJobSaved, saveJob, unsaveJob } from '../lib/firebase';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  Building, 
  CheckCircle, 
  Award,
  BookmarkPlus,
  BookmarkCheck,
  ArrowLeft
} from 'lucide-react';

const JobPage = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobData = await getJobById(id);
        if (!jobData) {
          setError("Job not found");
        } else {
          setJob(jobData);
          
          // Check if job is saved by current user
          if (auth.currentUser) {
            const savedStatus = await isJobSaved(auth.currentUser.uid, id);
            setIsSaved(savedStatus);
          }
        }
      } catch (err) {
        console.error("Error fetching job:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
    
    // Set up auth listener
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user && id) {
        isJobSaved(user.uid, id).then(saved => setIsSaved(saved));
      }
    });
    
    return () => unsubscribe();
  }, [id]);

  const handleSaveToggle = async () => {
    if (!user) {
      alert("Please login to save jobs");
      return;
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
      console.error("Error saving/unsaving job:", err);
      alert("Failed to save job. Please try again.");
    }
  };

  const handleApply = () => {
    if (job && job.companyUrl) {
      window.open(job.companyUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-600 p-4 rounded-md">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-300">Error</h2>
          <p className="text-red-700 dark:text-red-300">{error || "Job not found"}</p>
          <Link to="/jobs" className="text-blue-600 hover:underline mt-4 inline-block">
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} userRole={user ? "candidate" : null} />
      
      <main className="flex-grow py-6 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link to="/jobs" className="flex items-center text-blue-600 hover:underline mb-4">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Jobs
            </Link>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold">{job.title}</h1>
                    <h2 className="text-xl text-gray-700 dark:text-gray-300 mb-2">{job.companyName}</h2>
                  </div>
                  
                  {user && (
                    <button 
                      onClick={handleSaveToggle}
                      className="text-gray-500 hover:text-yellow-500"
                    >
                      {isSaved ? (
                        <BookmarkCheck className="h-6 w-6 text-yellow-500" />
                      ) : (
                        <BookmarkPlus className="h-6 w-6" />
                      )}
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center">
                    {/* <DollarSign className="h-5 w-5 mr-2 text-gray-500" /> */}
                    <span>{job.minSalary}LPA - {job.maxSalary}LPA</span>
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-gray-500" />
                    <span>{job.type}</span>
                  </div>
                  {job.postedAt && (
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-gray-500" />
                      <span>Posted {new Date(job.postedAt.seconds * 1000).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Button onClick={handleApply} className="bg-green-600 hover:bg-green-700">
                    Apply Now
                  </Button>
                  <Button variant="outline" onClick={handleSaveToggle}>
                    {isSaved ? 'Saved' : 'Save Job'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="description" className="mb-6">
            <TabsList className="w-full">
              <TabsTrigger value="description" className="flex-1">Description</TabsTrigger>
              <TabsTrigger value="requirements" className="flex-1">Requirements</TabsTrigger>
              <TabsTrigger value="benefits" className="flex-1">Benefits</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description">
              <Card>
                <CardHeader>
                  <CardTitle>Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-line">
                    {job.description}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="requirements">
              <Card>
                <CardHeader>
                  <CardTitle>Job Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.requirements?.map((requirement, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="benefits">
              <Card>
                <CardHeader>
                  <CardTitle>Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.benefits?.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <Award className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <Card>
            <CardHeader>
              <CardTitle>About {job.companyName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-xl font-bold text-blue-600 dark:text-blue-300 mr-3">
                  {job.companyName?.charAt(0).toUpperCase() || 'C'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{job.companyName}</h3>
                  <a 
                    href={job.companyUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Visit Company Website
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default JobPage;